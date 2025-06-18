const express = require("express");
const router = express.Router();

router.use("/", require("./defaultRoutes"));

module.exports = router;
