import express from "express";
const router = express.Router({ mergeParams: true });

import { verifySession } from "supertokens-node/recipe/session/framework/express";
import {
  deleteWorkspaceMember,
  getWorkspaceMembers,
  updateMemberAccess,
} from "../../controllers/memberController.js";

router.get("/", verifySession(), getWorkspaceMembers);
router.delete("/:userId", verifySession(), deleteWorkspaceMember);
router.patch("/:userId", verifySession(), updateMemberAccess);

export default router;
