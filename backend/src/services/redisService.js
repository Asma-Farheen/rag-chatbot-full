// backend/src/services/redisService.js
import { createClient } from 'redis';

// Key prefix for chat history
const HISTORY_KEY_PREFIX = 'chat:history:';
// Cache Expiration Time (Time To Live): 1 hour (3600 seconds)
const SESSION_TTL_SECONDS = 3600; 

const client = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

client.on('error', err => console.error('Redis Client Error', err));

// Connect to Redis on module load
client.connect().then(() => {
    console.log("✅ Redis client connected.");
}).catch(err => {
    console.error("❌ Failed to connect to Redis:", err);
});

/**
 * Saves a message (user or bot) to the session history in Redis.
 * @param {string} sessionId
 * @param {('user'|'bot')} role
 * @param {string} content
 */
export async function saveMessage(sessionId, role, content) {
    const key = HISTORY_KEY_PREFIX + sessionId;
    const message = JSON.stringify({ role, content, timestamp: new Date().toISOString() });
    
    // Add the message to the list and set/reset the TTL (cache warming)
    await client.rPush(key, message);
    await client.expire(key, SESSION_TTL_SECONDS); // Extends the session on new activity
}

/**
 * Retrieves the full chat history for a session.
 * @param {string} sessionId
 * @returns {Promise<Array<{role: 'user'|'bot', content: string}>>}
 */
export async function getSessionHistory(sessionId) {
    const key = HISTORY_KEY_PREFIX + sessionId;
    const messages = await client.lRange(key, 0, -1);
    
    // Parse the JSON strings back into objects
    return messages.map(msg => JSON.parse(msg));
}

/**
 * Deletes the chat history for a session.
 * @param {string} sessionId
 */
export async function clearSession(sessionId) {
    const key = HISTORY_KEY_PREFIX + sessionId;
    await client.del(key);
}