import express from "express";
const router = express.Router({ mergeParams: true });

import { verifySession } from "supertokens-node/recipe/session/framework/express";
import {
  createRenderSource,
  getWorkspaceRenderSources,
} from "../../controllers/RenderSourceController.js";

router.get("/", verifySession(), getWorkspaceRenderSources);
router.post("/create", verifySession(), createRenderSource);

export default router;
