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

router.get("/", verifySession(), getWorkspaces);
router.get("/owned", verifySession(), getOwnedWorkspaces);
router.get("/id/:workspaceId", verifySession(), getWorkspaceWithId);
router.get("/slug/:slug", verifySession(), getWorkspaceWithSlug);
router.post("/create", verifySession(), createWorkspace);

export default router;
