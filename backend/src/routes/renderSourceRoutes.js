import express from "express";
const router = express.Router();

import { verifySession } from "supertokens-node/recipe/session/framework/express";
import { getRenderSource } from "../controllers/RenderSourceController.js";

router.get("/:rendersourceId", verifySession(), getRenderSource);

export default router;
