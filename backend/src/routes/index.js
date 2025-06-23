const express = require("express");
const router = express.Router();

router.use("/", require("./defaultRoutes"));
router.use("/user", require("./userRoutes"));

module.exports = router;
