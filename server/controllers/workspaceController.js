import prisma from "../configs/prisma.js";

// Get all workspaces for user
export const getUserWorkspaces = async (req, res) => {
    try {

        const userId = req.userId;
        const workspaces = await prisma.workspace.findMany({
            where: {
                members: { some: { userId: userId } }
            },
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
        res.json({ workspaces });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
};

// Invite a member to a workspace by email
export const inviteMember = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { email, role = "MEMBER" } = req.body;

        // Find user by email
        const targetUser = await prisma.user.findUnique({ where: { email } });
        if (!targetUser) {
            return res.status(404).json({ message: "No user found with that email address" });
        }

        // Check if already a member
        const existing = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: targetUser.id, workspaceId } }
        });
        if (existing) {
            return res.status(400).json({ message: "User is already a member of this workspace" });
        }

        await prisma.workspaceMember.create({
            data: { userId: targetUser.id, workspaceId, role }
        });

        res.json({ message: "Member added to workspace successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
};