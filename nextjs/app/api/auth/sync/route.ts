import { prisma } from "@/services/database";

export async function POST(req: Request) {
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
