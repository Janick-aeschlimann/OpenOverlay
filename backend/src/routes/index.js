const express = require("express");
const router = express.Router();

router.use("/", require("./defaultRoutes"));
router.use("/user", require("./userRoutes"));
router.use("/workspace", require("./workspaceRoutes"));

module.exports = router;
