import express from "express";
import cors from "cors";

import routes from "./routes/index.js";

import { middleware, errorHandler } from "supertokens-node/framework/express";
import { initSuperTokens } from "./config/superTokens.js";

import SuperTokens from "supertokens-node";

initSuperTokens();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    allowedHeaders: ["content-type", ...SuperTokens.getAllCORSHeaders()],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

app.use(middleware());
app.use("/api", routes);
app.use(errorHandler());

export default app;
