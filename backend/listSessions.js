// backend/listSessions.js
// Usage: node listSessions.js

import { redisClient } from './src/redisClient.js';

async function listAllSessions() {
    try {
        // Get all session keys
        const keys = await redisClient.keys('session:*:messages');

        if (keys.length === 0) {
            console.log('❌ No active sessions found');
            return;
        }

        console.log(`✅ Found ${keys.length} active session(s):\n`);

        for (const key of keys) {
            // Extract session ID from key: session:123456:messages
            const sessionId = key.split(':')[1];

            // Get message count
            const history = await redisClient.get(key);
            const messages = JSON.parse(history);

            // Get TTL
            const ttl = await redisClient.ttl(key);
            const minutesLeft = Math.floor(ttl / 60);

            console.log(`📝 Session ID: ${sessionId}`);
            console.log(`   Messages: ${messages.length}`);
            console.log(`   Expires in: ${minutesLeft} minutes`);
            console.log(`   Last message: "${messages[messages.length - 1]?.content.substring(0, 50)}..."`);
            console.log('');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await redisClient.quit();
    }
}

listAllSessions();
