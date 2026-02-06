import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { PORT } from "./config/env.js";
import { initRedis, redisClient } from "./redisClient.js";
import { initQdrant, getQdrantClient } from "./utils/qdrantClient.js";
import { initGemini, getGeminiModel } from "./utils/geminiClient.js";
import { QDRANT_URL, GEMINI_API_KEY } from "./config/env.js";

async function initClients() {
  // Redis
  await initRedis();

  // Qdrant
  initQdrant();

  // Gemini
  initGemini();

  console.log("✅ Clients initialized:");
  console.log(`  - Redis: ${redisClient?.isOpen ? "connected" : "not_connected"}`);
  console.log(`  - Qdrant: ${QDRANT_URL}`);
  console.log(`  - Gemini: ${GEMINI_API_KEY ? "configured" : "not_configured"}`);
}

async function start() {
  try {
    await initClients();
    app.listen(PORT, () => {
      console.log(`🚀 Backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start backend:", err);
    process.exit(1);
  }
}

start();

export default app;
