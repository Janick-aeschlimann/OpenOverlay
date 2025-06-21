const express = require("express");
const cors = require("cors");

const routes = require("./routes/index");

const { middleware, errorHandler } = require("supertokens-node/framework/express");
const { initSuperTokens } = require("./config/superTokens");

initSuperTokens();

const app = express();

app.use(cors());
app.use(express.json());

app.use(middleware());
app.use("/api", routes);
app.use(errorHandler());

module.exports = app;
