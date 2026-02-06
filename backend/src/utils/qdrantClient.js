// ============================================================================
// QDRANT CLIENT - Vector Database for Semantic Search
// ============================================================================
// PURPOSE: Store and search article embeddings using vector similarity
//
// WHAT IS QDRANT?
// - Vector database optimized for similarity search
// - Stores embeddings (2048-dimensional vectors) with metadata
// - Uses cosine similarity to find similar articles
//
// WHY QDRANT?
// - Fast: Can search millions of vectors in milliseconds
// - Accurate: Uses HNSW (Hierarchical Navigable Small World) algorithm
// - Easy to use: Simple REST API
// - Open source: Can self-host (we use Docker)
//
// HOW IT WORKS:
// 1. We store article embeddings during ingestion (ingest.js)
// 2. When user asks a question, we convert it to an embedding
// 3. Qdrant finds articles with similar embeddings (cosine similarity)
// 4. Returns top N most similar articles
//
// INTERVIEW TIP: Explain cosine similarity vs Euclidean distance
// - Cosine: Measures angle between vectors (good for text)
// - Euclidean: Measures straight-line distance (good for coordinates)
// ============================================================================

import { QdrantClient } from "@qdrant/js-client-rest";
import { QDRANT_URL, QDRANT_COLLECTION, QDRANT_API_KEY } from "../config/env.js";

// Global Qdrant client instance (initialized once, reused for all requests)
let qdrant = null;

// ============================================================================
// FUNCTION: initQdrant
// ============================================================================
// PURPOSE: Initialize the Qdrant client connection (called on server startup)
//
// WHY INITIALIZE SEPARATELY?
// - Allows us to check connection before accepting requests
// - Reuses the same connection for all operations (more efficient)
// - Makes testing easier (can mock the client)
//
// CALLED FROM: server.js during startup
// ============================================================================
export function initQdrant() {
    // Create a new Qdrant client
    const options = {
        url: QDRANT_URL.replace(/\/+$/, ""),
    };
    if (QDRANT_API_KEY) {
        options.apiKey = QDRANT_API_KEY;
    }
    qdrant = new QdrantClient(options);
    return qdrant;
}

// ============================================================================
// FUNCTION: getQdrantClient
// ============================================================================
// PURPOSE: Get the initialized Qdrant client (for use in other files)
//
// WHY NEEDED?
// - Allows other modules to access the client without re-initializing
// - Follows the singleton pattern (one instance shared across app)
// ============================================================================
export function getQdrantClient() {
    return qdrant;
}

// ============================================================================
// FUNCTION: searchQdrant
// ============================================================================
// PURPOSE: Find the most similar articles to a query vector
//
// PARAMETERS:
// - vector: The query embedding (2048 numbers from Jina AI)
// - limit: How many results to return (default: 5)
//
// HOW IT WORKS:
// 1. Qdrant compares the query vector with all article vectors
// 2. Calculates cosine similarity for each (score 0-1, higher = more similar)
// 3. Returns top N articles sorted by similarity score
//
// RETURN VALUE:
// Array of search results:
// [
//   {
//     id: 1,
//     score: 0.89,  // 89% similar
//     payload: { title: "...", text: "...", ... }  // Original article data
//   },
//   {
//     id: 2,
//     score: 0.85,  // 85% similar
//     payload: { ... }
//   },
//   ...
// ]
//
// EXAMPLE USAGE:
// const queryVector = await embedTextWithJina("latest tech news");
// const results = await searchQdrant(queryVector, 5);
// // Returns top 5 most relevant articles
//
// INTERVIEW TIP: Explain the tradeoff between limit and relevance
// - Too few results (limit=1): Might miss important context
// - Too many results (limit=20): Adds noise, slows down AI generation
// - Sweet spot: 3-5 results for most queries
// ============================================================================
export async function searchQdrant(vector, limit = 5) {
    // Safety check: Make sure Qdrant client is initialized
    if (!qdrant) {
        throw new Error("Qdrant client not initialized");
    }

    // Perform vector similarity search
    // This uses the HNSW algorithm for fast approximate nearest neighbor search
    const result = await qdrant.search(
        QDRANT_COLLECTION,  // Collection name (e.g., "news_articles")
        {
            vector,          // The query vector (2048 numbers)
            limit,           // How many results to return
            with_payload: true,   // Include the original article data
            with_vectors: false,  // Don't return the vectors (we don't need them)
        }
    );

    // Return the search results
    return result;
    // Example: [{id: 1, score: 0.89, payload: {...}}, ...]
}

// ============================================================================
// INTERVIEW TALKING POINTS:
// ============================================================================
// 1. "Qdrant uses HNSW algorithm for fast approximate nearest neighbor search"
// 2. "We use cosine similarity because it focuses on direction, not magnitude"
// 3. "Vector databases are essential for RAG - they enable semantic search"
// 4. "We store 2048-dimensional vectors with full article metadata"
// 5. "Search is sub-linear time O(log N) thanks to HNSW indexing"
//
// COMMON INTERVIEW QUESTIONS:
// Q: Why use a vector database instead of traditional SQL?
// A: SQL can't efficiently search by similarity. It's designed for exact matches.
//    Vector databases use specialized indexes (HNSW) for similarity search.
//
// Q: What's cosine similarity?
// A: It measures the angle between two vectors. Score of 1 = identical,
//    0 = unrelated, -1 = opposite. We use it because text length doesn't matter,
//    only semantic meaning.
//
// Q: How does Qdrant scale?
// A: Uses HNSW (Hierarchical Navigable Small World) graphs for O(log N) search.
//    Can handle millions of vectors with millisecond response times.
//
// Q: Why with_payload: true but with_vectors: false?
// A: We need the article text (payload) to show the AI, but we don't need
//    the vectors again (we already have the query vector).
// ============================================================================
