import { prisma } from "@/services/database";

const SYNC_SECRET = process.env.SYNC_SECRET;

export async function POST(req: Request) {
    if (SYNC_SECRET) {
        const authHeader = req.headers.get("x-sync-secret");
        if (authHeader !== SYNC_SECRET) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    try {
        const body = await req.json();
        const { yandexId, email, displayName, avatarUrl } = body;

        if (!yandexId || typeof yandexId !== "string") {
            return Response.json(
                { error: "yandexId is required and must be a string" },
                { status: 400 }
            );
        }

        const user = await prisma.user.upsert({
            where: { yandexId },
            update: {
                email: email || null,
                displayName: displayName || null,
                avatarUrl: avatarUrl || null,
            },
            create: {
                yandexId,
                email: email || null,
                displayName: displayName || null,
                avatarUrl: avatarUrl || null,
            },
        });

        return Response.json(user);
    } catch (error) {
        console.error("Error syncing user:", error);
        return Response.json(
            { error: "Failed to sync user" },
            { status: 500 }
        );
    }
}
