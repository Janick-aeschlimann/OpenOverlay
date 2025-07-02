import "./config/yjs/persistence.js";
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { createServer } from "http";
import { setupWSConnection } from "./config/yjs/util.js";
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3000;

const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

const docs = new Map();

server.on("upgrade", async (req, socket, head) => {
  const cookies = req.headers.cookie || "";
  const parsedCookies = Object.fromEntries(cookies.split("; ").map((cookie) => cookie.split("=")));
  const token = parsedCookies.sAccessToken;
  wss.handleUpgrade(req, socket, head, (ws) => {
    const customReq = req;
    customReq.token = token;
    wss.emit("connection", ws, customReq);
  });
});

wss.on("connection", (ws, req) => {
  setupWSConnection(ws, req, { docs });
});

server.listen(PORT, process.env.API_HOST, () => {
  console.log(`Server Listening on Port: ${PORT}`);
});
