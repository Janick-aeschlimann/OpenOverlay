import express from "express";
const router = express.Router({ mergeParams: true });

import { verifySession } from "supertokens-node/recipe/session/framework/express";
import { createWorkspaceInvite, getWorkspaceInvites } from "../../controllers/inviteController.js";

router.get("/", verifySession(), getWorkspaceInvites);
router.post("/create", verifySession(), createWorkspaceInvite);

export default router;
