import express from "express";
const router = express.Router();

import defaultRoutes from "./defaultRoutes.js";
import userRoutes from "./userRoutes.js";
import workspaceRoutes from "./workspaceRoutes.js";

router.use("/", defaultRoutes);
router.use("/user", userRoutes);
router.use("/workspace", workspaceRoutes);

export default router;
