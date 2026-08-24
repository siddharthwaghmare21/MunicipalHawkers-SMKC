import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5109";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const path = (await params).path.join("/");
    return proxyRequest(req, path, "GET");
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const path = (await params).path.join("/");
    return proxyRequest(req, path, "POST");
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const path = (await params).path.join("/");
    return proxyRequest(req, path, "PUT");
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const path = (await params).path.join("/");
    return proxyRequest(req, path, "DELETE");
}

async function proxyRequest(req: NextRequest, path: string, method: string) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        const headers = new Headers();
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        const contentType = req.headers.get("content-type");
        if (contentType) {
            headers.set("Content-Type", contentType);
        }

        const options: RequestInit = {
            method,
            headers,
        };

        if (method !== "GET" && method !== "HEAD") {
            const bodyBuffer = await req.arrayBuffer();
            if (bodyBuffer.byteLength > 0) {
                options.body = Buffer.from(bodyBuffer);
            }
        }

        const searchParams = req.nextUrl.search;
        const url = `${BACKEND_URL}/api/documents/${path}${searchParams}`;

        const response = await fetch(url, options);
        
        const contentType = response.headers.get("content-type") || "";
        const contentDisposition = response.headers.get("content-disposition");
        const isBinary = contentType.startsWith("image/") || 
                         contentType.startsWith("application/pdf") || 
                         contentType.startsWith("application/octet-stream") || 
                         Boolean(contentDisposition) ||
                         path.startsWith("download");

        if (isBinary) {
            const buffer = await response.arrayBuffer();
            const headers: Record<string, string> = {
                "Content-Type": contentType || "application/octet-stream",
            };
            if (contentDisposition) {
                headers["Content-Disposition"] = contentDisposition;
            }
            return new NextResponse(buffer, {
                status: response.status,
                headers,
            });
        }
        
        const data = await response.text();

        return new NextResponse(data, {
            status: response.status,
            headers: {
                "Content-Type": contentType || "application/json",
            },
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
