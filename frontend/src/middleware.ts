import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode('super_secret_key_which_should_be_long_enough_12345!');

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Protect these routes
  const protectedPrefixes = ['/dashboard', '/hawkers', '/zones', '/settings'];
  const isProtected = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;

      // Basic role-based routing examples
      if (pathname.startsWith('/settings') && role !== 'IT_ADMIN' && role !== 'DEPARTMENT_ADMIN') {
        return NextResponse.redirect(new URL('/access-denied', request.url));
      }
      
      return NextResponse.next();
    } catch (error) {
      // Invalid token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // Redirect authenticated users away from login
  if (pathname === '/login' && token) {
    try {
      await jwtVerify(token, SECRET_KEY);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // Token is invalid, let them login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
