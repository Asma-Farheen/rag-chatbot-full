import { createClient } from "redis";
import { REDIS_URL } from "./config/env.js";

export const redisClient = createClient({ url: REDIS_URL });

export async function initRedis() {
  if (redisClient.isOpen) return;
  redisClient.on("error", (err) => console.error("Redis error:", err));
  await redisClient.connect();
  console.log("✅ Redis connected");
}
