import { redisClient } from "./redisClient.js";
import { SESSION_TTL } from "./config/env.js";

function sessionKey(sessionId) {
  return `session:${sessionId}:messages`;
}

function getSessionTTL() {
  return SESSION_TTL;
}

export async function getSessionHistory(sessionId) {
  if (!redisClient) return [];
  const raw = await redisClient.get(sessionKey(sessionId));
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse session history", e);
    return [];
  }
}

export async function saveSessionHistory(sessionId, messages) {
  if (!redisClient) return;
  await redisClient.setEx(
    sessionKey(sessionId),
    getSessionTTL(),
    JSON.stringify(messages)
  );
}

export async function clearSessionHistory(sessionId) {
  if (!redisClient) return;
  await redisClient.del(sessionKey(sessionId));
}
