import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.NEXT_PUBLIC_YANDEX_CLIENT_ID;
const CLIENT_SECRET = process.env.YANDEX_CLIENT_SECRET;

export async function POST(req: NextRequest) {
    try {
        if (!CLIENT_ID || !CLIENT_SECRET) {
            return NextResponse.json(
                { error: "Yandex OAuth credentials not configured" },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { code } = body;

        if (!code || typeof code !== "string") {
            return NextResponse.json(
                { error: "Authorization code is required" },
                { status: 400 }
            );
        }

        const params = new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        });

        const response = await fetch("https://oauth.yandex.ru/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: "Failed to exchange code for token", details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (!data.access_token) {
            return NextResponse.json(
                { error: "Token not received from Yandex" },
                { status: 400 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in Yandex OAuth:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
