const express = require("express");
const router = express.Router();

const { verifySession } = require("supertokens-node/recipe/session/framework/express");

router.get("/", (req, res) => {
  res.send("Hello World");
});

router.get("/authenticated", verifySession(), (req, res) => {
  res.send("You Are Authorized");
});

module.exports = router;
