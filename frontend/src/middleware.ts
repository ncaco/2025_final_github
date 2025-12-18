import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/auth";

export default auth((req: NextRequest) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // 로그인 안 된 사용자는 /dashboard 이하 접근 시 /login 으로 리다이렉트
  if (!isLoggedIn && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  // 역할 기반 예시: /dashboard/users 는 ADMIN 만 접근 가능
  if (
    pathname.startsWith("/dashboard/users") &&
    req.auth?.user &&
    (req.auth.user as any).role !== "ADMIN"
  ) {
    const redirectUrl = new URL("/dashboard", nextUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};


