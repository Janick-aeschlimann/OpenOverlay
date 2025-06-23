const express = require("express");
const router = express.Router();

const { verifySession } = require("supertokens-node/recipe/session/framework/express");

const { createUser, getUsers, getOwnUser } = require("../controllers/userController");

router.get("/", verifySession(), getUsers);
router.get("/me", verifySession(), getOwnUser);
router.post("/create", verifySession(), createUser);

module.exports = router;
