import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { createServer } from "http";

const PORT = process.env.PORT || 3000;

const server = createServer(app);

server.listen(PORT, process.env.API_HOST, () => {
  console.log(`Server Listening on Port: ${PORT}`);
});
