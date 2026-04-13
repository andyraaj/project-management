import express from "express";
import { getUserWorkspaces, inviteMember } from "../controllers/workspaceController.js";
import { createWorkspace } from "../controllers/workspaceOrgController.js";

const workspaceRouter = express.Router();

workspaceRouter.get("/", getUserWorkspaces);
workspaceRouter.post("/create", createWorkspace);
workspaceRouter.post("/:workspaceId/invite", inviteMember);

export default workspaceRouter;
