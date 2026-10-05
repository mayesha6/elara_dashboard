import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const authPaths = [
    "/login",
    "/forget-password",
    "/reset-password",
    "/otp-verify",
    "/create-password",
  ];

  const isAuthPage = authPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const hasAuthToken = Boolean(accessToken || refreshToken);

  let response: NextResponse;

  if (!isAuthPage && !hasAuthToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    response = NextResponse.redirect(loginUrl);
  } else if (isAuthPage && hasAuthToken) {
    response = NextResponse.redirect(new URL("/", request.url));
  } else {
    response = NextResponse.next();
  }

  // Disable bfcache storing of auth state
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
