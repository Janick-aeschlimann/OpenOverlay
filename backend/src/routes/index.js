import express from "express";
const router = express.Router();

import defaultRoutes from "./defaultRoutes.js";
import userRoutes from "./userRoutes.js";
import workspaceRoutes from "./workspaceRoutes.js";
import yjsRoutes from "./yjsRoutes.js";
import renderSourceRoutes from "./renderSourceRoutes.js";

router.use("/", defaultRoutes);
router.use("/user", userRoutes);
router.use("/workspace", workspaceRoutes);
router.use("/yjs", yjsRoutes);
router.use("/rendersource", renderSourceRoutes);

export default router;
