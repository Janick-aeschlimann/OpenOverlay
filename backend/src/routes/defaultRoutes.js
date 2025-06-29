import express from "express";
const router = express.Router();

import { verifySession } from "supertokens-node/recipe/session/framework/express";

router.get("/", (req, res) => {
  res.send("Hello World");
});

router.get("/authenticated", verifySession(), (req, res) => {
  res.send("You Are Authorized");
});

export default router;
