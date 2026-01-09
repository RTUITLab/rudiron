import { prisma } from "@/services/database";
import { authenticateRequest } from "@/utils/auth";

export async function GET(req: Request) {
    try {
        const user = await authenticateRequest(req);
        if (!user) {
            return Response.json({ error: "Not authenticated" }, { status: 401 });
        }

        return Response.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return Response.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}
