import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Look for the JWT cookie
    const token = request.cookies.get('auth_token')?.value;

    // 2. If no token is found, redirect them to the dedicated Auth Website
    if (!token) {
        // We append where they were trying to go so we can send them back later
        const loginUrl = new URL('https://master.di7fhjhw0ua49.amplifyapp.com', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 3. If they have the token, let them enter the Control Tower
    return NextResponse.next();
}

// 4. Specify which routes to protect
export const config = {
    matcher: [
        '/dashboard/:path*', 
        '/' // Protect the root page
    ],
};