import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const backendRes = await fetch(`http://localhost:5109/api/licenses/${params.id}`, {
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const body = await request.json();

  const backendRes = await fetch(`http://localhost:5109/api/licenses/${params.id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}
