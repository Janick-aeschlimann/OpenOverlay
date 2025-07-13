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

router.get("/", verifySession(), getWorkspaces);
router.get("/owned", verifySession(), getOwnedWorkspaces);
router.get("/id/:workspaceId", verifySession(), getWorkspaceWithId);
router.get("/slug/:slug", verifySession(), getWorkspaceWithSlug);
router.post("/create", verifySession(), createWorkspace);

router.use("/:workspaceId/overlay", overlayRoutes);
router.use("/:workspaceId/rendersource", renderSourceRoutes);

export default router;
