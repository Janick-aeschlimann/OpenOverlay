import express from "express";
const router = express.Router();

import { verifySession } from "supertokens-node/recipe/session/framework/express";
import {
  acceptWorkspaceInvite,
  deleteWorkspaceInvite,
  getWorkspaceInvite,
} from "../controllers/inviteController.js";

router.delete("/:inviteId", verifySession(), deleteWorkspaceInvite);
router.post("/:token", verifySession(), acceptWorkspaceInvite);
router.get("/:token", verifySession(), getWorkspaceInvite);

export default router;
