import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const backendRes = await fetch('http://localhost:5109/api/dashboard', {
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
