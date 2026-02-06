// backend/src/services/qdrantService.js
import { QdrantClient } from 'qdrant-client';

const QDRANT_COLLECTION = 'news_articles_rag';

const client = new QdrantClient({ 
    host: process.env.QDRANT_HOST, 
    port: parseInt(process.env.QDRANT_PORT), 
    // apiKey: process.env.QDRANT_API_KEY // Only needed if using cloud/secure Qdrant
});

/**
 * Checks if the Qdrant collection exists and creates it if not.
 */
export async function setupQdrantCollection(vectorSize) {
    const collections = await client.getCollections();
    const exists = collections.collections.some(c => c.name === QDRANT_COLLECTION);
    
    if (!exists) {
        console.log(`Creating Qdrant collection: ${QDRANT_COLLECTION} with vector size ${vectorSize}...`);
        await client.createCollection(QDRANT_COLLECTION, {
            vectors: {
                size: vectorSize, // Size must match the Jina embedding model output
                distance: 'Cosine',
            },
        });
        console.log("Collection created.");
    } else {
        console.log("Qdrant collection already exists.");
    }
}

/**
 * Inserts news articles and their vectors into the Qdrant collection.
 * @param {Array<{id: string, vector: number[], payload: object}>} points 
 */
export async function upsertPoints(points) {
    // Upsert (insert or update) points in batches
    await client.upsert(QDRANT_COLLECTION, { wait: true, points });
    console.log(`Successfully inserted ${points.length} points into Qdrant.`);
}

/**
 * Searches Qdrant for the top-k nearest neighbors to a query vector.
 * @param {number[]} vector - The embedding vector of the user query.
 * @param {number} k - The number of passages to retrieve.
 * @returns {Promise<object[]>} - Top-k search results.
 */
export async function searchQdrant(vector, k) {
    return client.search(QDRANT_COLLECTION, {
        vector: vector,
        limit: k,
        with_payload: true, // Return the actual news text
    });
}