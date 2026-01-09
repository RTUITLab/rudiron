import { prisma } from "@/services/database";
import { authenticateRequest } from "@/utils/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateRequest(req);
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const workflow = await prisma.workflow.findFirst({
            where: { id, userId: user.id },
        });

        if (!workflow)
            return Response.json({ error: "Workflow not found" }, { status: 404 });

        return Response.json(workflow);
    } catch (error) {
        console.error("Error fetching workflow:", error);
        return Response.json({ error: "Failed to fetch workflow" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateRequest(req);
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { name, description, blocks, transform } = body;

        const existingWorkflow = await prisma.workflow.findFirst({
            where: { id, userId: user.id },
        });

        if (!existingWorkflow) {
            return Response.json({ error: "Workflow not found" }, { status: 404 });
        }

        const updateData: {
            name?: string;
            description?: string | null;
            blocks?: any;
            transform?: any;
        } = {};

        if (name !== undefined) {
            if (typeof name === "string" && name.trim().length > 0) {
                updateData.name = name.trim();
            } else {
                return Response.json({ error: "name must be a non-empty string" }, { status: 400 });
            }
        }

        if (description !== undefined) {
            updateData.description = description || null;
        }

        if (blocks !== undefined) {
            updateData.blocks = blocks;
        }

        if (transform !== undefined) {
            updateData.transform = transform;
        }

        const workflow = await prisma.workflow.update({
            where: { id },
            data: updateData,
        });

        return Response.json(workflow);
    } catch (error) {
        console.error("Error updating workflow:", error);
        return Response.json({ error: "Failed to update workflow" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateRequest(req);
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const existingWorkflow = await prisma.workflow.findFirst({
            where: { id, userId: user.id },
        });

        if (!existingWorkflow) {
            return Response.json({ error: "Workflow not found" }, { status: 404 });
        }

        await prisma.workflow.delete({ where: { id } });

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting workflow:", error);
        return Response.json({ error: "Failed to delete workflow" }, { status: 500 });
    }
}
