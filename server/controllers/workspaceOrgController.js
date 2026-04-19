import prisma from "../configs/prisma.js";

function generateSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);
}

export const createWorkspace = async (req, res) => {
    try {
        const { name } = req.body;
        const ownerId = req.userId;

        if (!name) {
            return res.status(400).json({ message: "Workspace name is required" });
        }

        const slug = generateSlug(name);

        const workspace = await prisma.workspace.create({
            data: {
                name,
                slug,
                ownerId,
                image_url: "", // Can add an avatar/image later
            },
        });

        // Add creator as ADMIN member
        await prisma.workspaceMember.create({
            data: {
                userId: ownerId,
                workspaceId: workspace.id,
                role: "ADMIN",
            },
        });

        const workspaceWithMembers = await prisma.workspace.findUnique({
            where: { id: workspace.id },
            include: {
                members: { include: { user: true } },
                projects: {
                    include: {
                        tasks: { include: { assignee: true, comments: { include: { user: true } } } },
                        members: { include: { user: true } }
                    }
                },
                owner: true
            }
        });

        res.status(201).json({ workspace: workspaceWithMembers, message: "Workspace created successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
};
