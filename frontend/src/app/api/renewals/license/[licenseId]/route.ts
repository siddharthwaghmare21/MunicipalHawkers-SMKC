import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request, { params }: { params: Promise<{ licenseId: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const backendRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5109'}/api/renewals/license/${(await params).licenseId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    cache: 'no-store'
  });

  if (!backendRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: backendRes.status });
  }

  const data = await backendRes.json();
  return NextResponse.json(data);
}
