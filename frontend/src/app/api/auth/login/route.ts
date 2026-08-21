import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Call the .NET backend
    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5109'}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!backendRes.ok) {
        const errorData = await backendRes.json().catch(() => ({}));
        return NextResponse.json({ error: errorData.message || 'Invalid credentials' }, { status: 401 });
    }

    const responseData = await backendRes.json();
    const token = responseData.data?.token || responseData.token;
    
    if (!token) {
        return NextResponse.json({ error: 'Invalid response from server' }, { status: 500 });
    }

    // Set HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 2 // 2 hours
    });

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
