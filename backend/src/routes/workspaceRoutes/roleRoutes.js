import express from "express";
const router = express.Router({ mergeParams: true });

import { verifySession } from "supertokens-node/recipe/session/framework/express";
import {
  createWorkspaceRole,
  deleteWorkspaceRole,
  getWorkspaceRoles,
} from "../../controllers/roleController.js";

router.get("/", verifySession(), getWorkspaceRoles);
router.post("/create", verifySession(), createWorkspaceRole);
router.delete("/:roleId", verifySession(), deleteWorkspaceRole);

export default router;
