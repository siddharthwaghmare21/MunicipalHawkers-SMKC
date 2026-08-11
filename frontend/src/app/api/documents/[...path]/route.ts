import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
    const path = (await params).path.join("/");
    return proxyRequest(req, path, "GET");
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
    const path = (await params).path.join("/");
    return proxyRequest(req, path, "POST");
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
    const path = (await params).path.join("/");
    return proxyRequest(req, path, "PUT");
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
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

        // Only set Content-Type if it's not a FormData upload
        const contentType = req.headers.get("content-type");
        if (contentType && !contentType.includes("multipart/form-data")) {
            headers.set("Content-Type", contentType);
        }

        const options: RequestInit = {
            method,
            headers,
        };

        if (method !== "GET" && method !== "HEAD") {
            // If it's multipart/form-data, pass the raw request body stream directly
            if (contentType?.includes("multipart/form-data")) {
                options.body = req.body;
                // @ts-ignore
                options.duplex = 'half';
            } else {
                // Otherwise try to get text payload
                const bodyText = await req.text();
                if (bodyText) {
                    options.body = bodyText;
                }
            }
        }

        const searchParams = req.nextUrl.search;
        const url = `${BACKEND_URL}/api/documents/${path}${searchParams}`;

        const response = await fetch(url, options);
        
        // Handle file downloads
        if (response.headers.get("content-disposition")) {
            return new NextResponse(response.body, {
                status: response.status,
                headers: {
                    "Content-Disposition": response.headers.get("content-disposition") || "",
                    "Content-Type": response.headers.get("content-type") || "application/octet-stream",
                },
            });
        }
        
        const data = await response.text();

        return new NextResponse(data, {
            status: response.status,
            headers: {
                "Content-Type": response.headers.get("content-type") || "application/json",
            },
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
