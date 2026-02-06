// ============================================================================
// RAG SERVICE - The Heart of the RAG (Retrieval-Augmented Generation) System
// ============================================================================
// PURPOSE: This file implements the core RAG logic that powers our chatbot
// 
// WHAT IS RAG?
// - Instead of letting AI make up answers, we give it real news articles as context
// - Think of it like an open-book exam: AI can only answer based on the articles we provide
//
// WHY WE USE THIS APPROACH:
// - Prevents AI hallucinations (making up fake information)
// - Ensures answers are grounded in actual news data
// - Allows us to control and audit the information sources
// ============================================================================

import { redisClient } from "../redisClient.js";
import { CACHE_TTL_SECONDS } from "../config/env.js";
import { embedTextWithJina } from "../utils/jinaClient.js";
import { searchQdrant } from "../utils/qdrantClient.js";
import { generateAnswerWithGemini } from "../utils/geminiClient.js";

// ============================================================================
// FUNCTION: getCached
// ============================================================================
// PURPOSE: Check if we've already answered this question before (performance optimization)
//
// WHY CACHING?
// - Saves money: Avoid repeated API calls to Jina AI, Qdrant, and Gemini
// - Faster responses: Return cached answers in milliseconds instead of seconds
// - Better UX: Users get instant answers for common questions
//
// INTERVIEW TIP: Explain that this is a "read-through cache" pattern
// ============================================================================
export async function getCached(query) {
    // Safety check: Make sure Redis is connected before trying to use it
    if (!redisClient || !redisClient.isOpen) return null;

    // Create a unique cache key for this question
    // Example: "rag:news:what's the latest tech news?"
    // We use .trim() to remove spaces and .toLowerCase() to treat "Tech News" and "tech news" as the same
    const key = `rag:news:${query.trim().toLowerCase()}`;

    // Ask Redis: "Do you have a cached answer for this question?"
    const raw = await redisClient.get(key);

    // If Redis says "no", return null (cache miss)
    if (!raw) return null;

    // If Redis says "yes", convert the stored JSON string back to a JavaScript object
    try {
        return JSON.parse(raw); // Convert: '{"answer":"..."}' → {answer: "..."}
    } catch {
        // If JSON parsing fails (corrupted data), return null
        return null;
    }
}

// ============================================================================
// FUNCTION: setCached
// ============================================================================
// PURPOSE: Save the answer to Redis so we can reuse it later
//
// WHY setEx (SET with EXpiration)?
// - Automatically deletes old cache entries after CACHE_TTL_SECONDS (1 hour)
// - Prevents stale data (news changes frequently)
// - Saves memory (Redis doesn't fill up with old data)
//
// INTERVIEW TIP: Mention TTL (Time To Live) strategy for cache invalidation
// ============================================================================
export async function setCached(query, data) {
    // Safety check: Make sure Redis is connected
    if (!redisClient || !redisClient.isOpen) return;

    // Create the same cache key format
    const key = `rag:news:${query.trim().toLowerCase()}`;

    // Save to Redis with automatic expiration
    // setEx(key, seconds, value)
    await redisClient.setEx(
        key,                      // The cache key
        CACHE_TTL_SECONDS,        // How long to keep it (default: 3600 seconds = 1 hour)
        JSON.stringify(data)      // Convert object to JSON string for storage
    );
}

// ============================================================================
// FUNCTION: buildContextFromPoints
// ============================================================================
// PURPOSE: Format the retrieved articles into a readable "cheat sheet" for the AI
//
// WHY THIS FORMAT?
// - Markdown-style headers (###) help AI understand structure
// - Separators (---) clearly divide different articles
// - Makes it easy for AI to cite specific articles
//
// INPUT: Array of Qdrant search results (articles with similarity scores)
// OUTPUT: Formatted text like:
//   ### Apple Releases iPhone 16
//   Apple announced the new iPhone 16...
//   
//   ---
//   
//   ### Samsung Galaxy S24 Launch
//   Samsung unveiled the Galaxy S24...
//
// INTERVIEW TIP: This is called "prompt engineering" - formatting data for optimal AI understanding
// ============================================================================
function buildContextFromPoints(points) {
    // Edge case: If no articles found, return a helpful message
    if (!points || points.length === 0) return "No relevant articles found.";

    // Transform each article into a formatted section
    return points
        .map((pt, idx) => {
            // Extract the article data (payload contains the original article)
            const p = pt.payload || {};

            // Get the title (try different field names, fallback to generic)
            const title = p.title || p.headline || `Article ${idx + 1}`;

            // Get the article text (try different field names)
            const text = p.text || p.content || p.body || JSON.stringify(p, null, 2);

            // Format as Markdown: ### Title\nContent
            return `### ${title}\n${text}`;
        })
        .join("\n\n---\n\n"); // Separate articles with horizontal rules
}

// ============================================================================
// FUNCTION: runRagQuery - THE MAIN RAG PIPELINE
// ============================================================================
// PURPOSE: The complete RAG workflow from question to answer
//
// THE 8-STEP RAG FLOW:
// 1. Check cache (fast path)
// 2. Convert question to embeddings (numbers)
// 3. Search vector database for similar articles
// 4. Format articles as context
// 5. Ask AI to generate answer based on context
// 6. Package the response
// 7. Save to cache
// 8. Return to user
//
// WHY THIS ORDER?
// - Cache first = fastest possible response
// - Embeddings before search = required by vector databases
// - Context formatting = optimizes AI understanding
// - Cache last = benefits future requests
//
// INTERVIEW TIP: This demonstrates the "pipeline pattern" - sequential data transformations
// ============================================================================
export async function runRagQuery(query) {
    // STEP 1: Check if we've answered this question before
    const cached = await getCached(query);
    if (cached) return { ...cached, cached: true }; // Return cached answer immediately (fast!)

    // STEP 2: Convert the user's question into a 2048-dimensional vector (array of numbers)
    // WHY? Vector databases can only search using numbers, not text
    // "retrieval.query" tells Jina to optimize for search queries (vs documents)
    const vector = await embedTextWithJina(query, "retrieval.query");
    // Result: [0.234, -0.567, 0.123, ... 2048 numbers total]

    // STEP 3: Search Qdrant for the top 5 most similar articles
    // HOW? Qdrant compares the query vector with all article vectors using cosine similarity
    // Articles with similar meaning will have similar vectors
    const points = await searchQdrant(vector, 5);
    // Result: [{id: 1, score: 0.89, payload: {...}}, {id: 2, score: 0.85, ...}, ...]

    // STEP 4: Format the articles into a readable context for the AI
    // This creates a "cheat sheet" that the AI can reference
    const context = buildContextFromPoints(points);
    // Result: "### Article 1\nContent...\n\n---\n\n### Article 2\nContent..."

    // STEP 5: Ask Gemini AI to answer the question using ONLY the provided context
    // This is the "Generation" part of RAG
    const answer = await generateAnswerWithGemini(query, context);
    // Result: "Based on recent articles, the main tech news includes..."

    // STEP 6: Prepare the source citations (which articles we used)
    // This allows the frontend to show "sources" if needed
    const sources = points.map((pt) => ({
        id: pt.id,              // Article ID
        score: pt.score,        // Similarity score (0-1, higher = more relevant)
        payload: pt.payload,    // Original article data
    }));

    // STEP 7: Package everything together
    const payload = { answer, sources, cached: false };

    // STEP 8: Save to cache for next time (benefits future users)
    await setCached(query, payload);

    // STEP 9: Return the complete response
    return payload;
}

// ============================================================================
// INTERVIEW TALKING POINTS:
// ============================================================================
// 1. "We use RAG to prevent AI hallucinations by grounding answers in real data"
// 2. "Redis caching reduces API costs and improves response time by 10x"
// 3. "We use asymmetric embeddings - different optimization for queries vs documents"
// 4. "The pipeline pattern makes the code testable and maintainable"
// 5. "Cosine similarity in vector search focuses on semantic meaning, not exact words"
// ============================================================================
