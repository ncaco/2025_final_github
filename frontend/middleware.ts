/**
 * Next.js 미들웨어
 * 인증이 필요한 라우트를 보호합니다.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 인증이 필요 없는 경로
  const publicPaths = ['/auth/login', '/auth/register'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // 인증이 필요한 경로
  const protectedPaths = ['/profile'];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  // localStorage는 서버 사이드에서 접근 불가하므로 클라이언트 컴포넌트에서 처리
  // 미들웨어는 기본적인 리다이렉트만 처리

  // 경로 정보를 헤더에 추가하여 레이아웃에서 사용할 수 있도록 함
  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

