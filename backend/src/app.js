const express = require("express");
const cors = require("cors");

const routes = require("./routes/index");

const supertokens = require("supertokens-node");

const { middleware, errorHandler } = require("supertokens-node/framework/express");
const { initSuperTokens } = require("./config/superTokens");

initSuperTokens();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3001",
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
    credentials: true,
  })
);
app.use(express.json());

app.use(middleware());
app.use("/api", routes);
app.use(errorHandler());

module.exports = app;
