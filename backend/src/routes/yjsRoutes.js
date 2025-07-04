import express from "express";
import { getDocumentPermission, roomUpdate } from "../controllers/yjsController.js";
const router = express.Router();

router.put("/ydoc/:room", roomUpdate);

router.get("/auth/perm/:room/:userid", getDocumentPermission);

export default router;
