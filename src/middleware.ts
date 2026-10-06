import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = btoa(crypto.randomUUID());
  const isDevelopment = process.env.NODE_ENV !== "production";
  const connectSources = [
    "'self'",
    "https://api.greetely.com",
    "https://greetely.com",
    "https://dashboard.greetely.com",
    "https://api.stripe.com",
    "wss://api.greetely.com",
    ...(isDevelopment ? ["http://localhost:*", "ws://localhost:*"] : []),
  ].join(" ");
  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https:",
    `connect-src ${connectSources}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

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
    response = NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Disable bfcache storing of auth state
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
