import { prisma } from "@/services/database";
import { getUserInfo } from "@/services/auth";

export async function authenticateRequest(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.substring(7);
    const userInfo = await getUserInfo(token);
    if (!userInfo) return null;

    const user = await prisma.user.upsert({
        where: { yandexId: userInfo.id },
        update: {
            email: userInfo.default_email,
            displayName: userInfo.display_name,
            avatarUrl: userInfo.default_avatar_id
                ? `https://avatars.yandex.net/get-yapic/${userInfo.default_avatar_id}/islands-200`
                : null,
        },
        create: {
            yandexId: userInfo.id,
            email: userInfo.default_email,
            displayName: userInfo.display_name,
            avatarUrl: userInfo.default_avatar_id
                ? `https://avatars.yandex.net/get-yapic/${userInfo.default_avatar_id}/islands-200`
                : null,
        },
    });

    return user;
}

