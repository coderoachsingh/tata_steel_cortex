import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const urlToken = request.nextUrl.searchParams.get('token');

    // Agar URL mein token hai, toh use cookie mein save karein aur root ('/') par redirect karein
    if (urlToken) {
        // YAHAN CHANGE KIYA GAYA HAI: '/dashboard' ki jagah sirf '/' lagaya hai
        const response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.set('auth_token', urlToken, {
            httpOnly: true,
            secure: true,
            path: '/'
        });
        return response;
    }

    // Baaki logic same rahega...
    const cookieToken = request.cookies.get('auth_token');
    if (!cookieToken) {
        return NextResponse.redirect(new URL('https://master.di7fhjhw0ua49.amplifyapp.com', request.url));
    }

    return NextResponse.next();
}