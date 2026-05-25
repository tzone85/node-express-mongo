import "dotenv/config";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { connectMongo } from "./db/connect.js";

async function start() {
  const config = loadConfig();
  await connectMongo(config.mongoUrl);
  console.log(`mongo connected: ${config.mongoUrl}`);
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`node-express-mongo listening on :${config.port}`);
  });
}

start().catch((err) => {
  console.error("startup failed:", err);
  process.exitCode = 1;
});
