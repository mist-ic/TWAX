import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "twax-auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: NextRequest) {
    const { password } = await req.json();
    const correctPassword = process.env.DASHBOARD_PASSWORD;

    if (!correctPassword) {
        // No password set = allow everyone (dev mode)
        const res = NextResponse.json({ ok: true });
        res.cookies.set(COOKIE_NAME, "open", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: COOKIE_MAX_AGE,
            path: "/",
        });
        return res;
    }

    if (password !== correctPassword) {
        return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });
    }

    // Create a simple token (hash of password + secret)
    const token = Buffer.from(`${correctPassword}:${Date.now()}`).toString("base64");

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
    });
    return res;
}

export async function DELETE() {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(COOKIE_NAME);
    return res;
}
