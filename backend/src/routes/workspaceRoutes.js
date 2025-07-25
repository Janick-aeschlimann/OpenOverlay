import express from "express";
const router = express.Router();

import { verifySession } from "supertokens-node/recipe/session/framework/express";

import {
  getWorkspaceWithId,
  getWorkspaceWithSlug,
  getWorkspaces,
  getOwnedWorkspaces,
  createWorkspace,
} from "../controllers/workspaceController.js";

import overlayRoutes from "./workspaceRoutes/overlayRoutes.js";
import renderSourceRoutes from "./workspaceRoutes/renderSourceRoutes.js";
import memberRoutes from "./workspaceRoutes/memberRoutes.js";
import inviteRoutes from "./workspaceRoutes/inviteRoutes.js";
import roleRoutes from "./workspaceRoutes/roleRoutes.js";

router.get("/", verifySession(), getWorkspaces);
router.get("/owned", verifySession(), getOwnedWorkspaces);
router.get("/id/:workspaceId", verifySession(), getWorkspaceWithId);
router.get("/slug/:slug", verifySession(), getWorkspaceWithSlug);
router.post("/create", verifySession(), createWorkspace);

router.use("/:workspaceId/overlay", overlayRoutes);
router.use("/:workspaceId/rendersource", renderSourceRoutes);
router.use("/:workspaceId/member", memberRoutes);
router.use("/:workspaceId/invite", inviteRoutes);
router.use("/:workspaceId/role", roleRoutes);

export default router;
