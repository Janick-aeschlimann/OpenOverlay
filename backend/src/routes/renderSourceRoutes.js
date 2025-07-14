import express from "express";
const router = express.Router();

import { verifySession } from "supertokens-node/recipe/session/framework/express";
import {
  getRenderSource,
  getRenderSourceWithToken,
  patchRenderSource,
} from "../controllers/RenderSourceController.js";

router.get("/:rendersourceId", verifySession(), getRenderSource);
router.patch("/:rendersourceId", verifySession(), patchRenderSource);
router.get("/token/:token", getRenderSourceWithToken);

export default router;
