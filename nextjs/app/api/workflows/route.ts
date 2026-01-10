import { NextRequest } from "next/server";
import { prisma } from "@/services/database";
import { authenticateRequest } from "@/utils/auth";

export async function GET(req: Request) {
    try {
        const user = await authenticateRequest(req);
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const workflows = await prisma.workflow.findMany({
            where: { userId: user.id },
            orderBy: { updatedAt: "desc" },
        });

        return Response.json(workflows);
    } catch (error) {
        console.error("Error fetching workflows:", error);
        return Response.json({ error: "Failed to fetch workflows" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await authenticateRequest(req);
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { name, description, blocks, transform, liked } = body;
        
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return Response.json({ error: "name is required and must be a non-empty string" }, { status: 400 });
        }

        const workflow = await prisma.workflow.create({
            data: {
                name: name.trim(),
                description: description || null,
                blocks: blocks || [],
                transform: transform || null,
                liked: liked !== undefined ? liked : false,
                userId: user.id,
            },
        });

        return Response.json(workflow);
    } catch (error) {
        console.error("Error creating workflow:", error);
        return Response.json({ error: "Failed to create workflow" }, { status: 500 });
    }
}
