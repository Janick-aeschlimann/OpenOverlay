import express from "express";
const router = express.Router();

import { verifySession } from "supertokens-node/recipe/session/framework/express";

import { createUser, getUsers, getOwnUser } from "../controllers/userController.js";
import { uploadProfilePicture } from "../middlewares/multer.js";

router.get("/", verifySession(), getUsers);
router.get("/me", verifySession(), getOwnUser);
router.post("/create", verifySession(), uploadProfilePicture.single("profile_picture"), createUser);

export default router;
