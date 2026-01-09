import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/auth/callback', '/'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith('/api/auth'));
    
    if (isPublicPath) {
        return NextResponse.next();
    }
    
    const token = request.cookies.get('yandex_token');
    
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

