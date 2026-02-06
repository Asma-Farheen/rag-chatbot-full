// backend/checkHistory.js
// Usage: node checkHistory.js <sessionId>

import { redisClient } from './src/redisClient.js';

const sessionId = process.argv[2];

if (!sessionId) {
    console.log('Usage: node checkHistory.js <sessionId>');
    console.log('Example: node checkHistory.js 123456');
    process.exit(1);
}

async function checkHistory() {
    try {
        const key = `session:${sessionId}:messages`;
        const history = await redisClient.get(key);

        if (!history) {
            console.log(`❌ No history found for session: ${sessionId}`);
            return;
        }

        const messages = JSON.parse(history);
        console.log(`✅ Session ${sessionId} - ${messages.length} messages:\n`);

        messages.forEach((msg, idx) => {
            console.log(`${idx + 1}. [${msg.role.toUpperCase()}]`);
            console.log(`   ${msg.content}\n`);
        });

        // Check TTL
        const ttl = await redisClient.ttl(key);
        console.log(`⏱️  Expires in: ${Math.floor(ttl / 60)} minutes`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await redisClient.quit();
    }
}

checkHistory();
