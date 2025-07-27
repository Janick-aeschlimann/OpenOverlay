import express from "express";
const router = express.Router({ mergeParams: true });

import { verifySession } from "supertokens-node/recipe/session/framework/express";
import {
  createWorkspaceInvite,
  getWorkspaceInvites,
  deleteWorkspaceInvite,
} from "../../controllers/inviteController.js";

router.get("/", verifySession(), getWorkspaceInvites);
router.post("/create", verifySession(), createWorkspaceInvite);
router.delete("/:inviteId", verifySession(), deleteWorkspaceInvite);

export default router;
