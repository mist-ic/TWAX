import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth"];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow public paths and static assets
    if (
        PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // If no password configured, skip auth (dev mode)
    const passwordConfigured = process.env.DASHBOARD_PASSWORD;
    if (!passwordConfigured) {
        return NextResponse.next();
    }

    // Check auth cookie
    const authCookie = req.cookies.get("twax-auth");
    if (!authCookie?.value) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
