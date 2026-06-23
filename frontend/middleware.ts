import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const urlToken = request.nextUrl.searchParams.get('token');

    // If a token is provided in the URL, save it as a secure cookie
    if (urlToken) {
        const response = NextResponse.redirect(new URL('/dashboard', request.url));
        response.cookies.set('auth_token', urlToken, {
            httpOnly: true,
            secure: true,
            path: '/'
        });
        return response;
    }

    // Otherwise, check for an existing cookie
    const cookieToken = request.cookies.get('auth_token');
    if (!cookieToken) {
        return NextResponse.redirect(new URL('https://master.di7fhjhw0ua49.amplifyapp.com', request.url));
    }

    return NextResponse.next();
}