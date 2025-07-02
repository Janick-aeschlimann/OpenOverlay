import express from "express";
const router = express.Router({ mergeParams: true });

import { verifySession } from "supertokens-node/recipe/session/framework/express";

import {
  createOverlay,
  getWorkspaceOverlay,
  getWorkspaceOverlays,
} from "../controllers/overlayController.js";

router.get("/", verifySession(), getWorkspaceOverlays);
router.post("/create", verifySession(), createOverlay);
router.get("/:overlayId", verifySession(), getWorkspaceOverlay);

export default router;
