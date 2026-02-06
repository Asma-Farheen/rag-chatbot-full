// ============================================================================
// JINA AI CLIENT - Text Embedding Service
// ============================================================================
// PURPOSE: Convert text into numerical vectors (embeddings) for semantic search
//
// WHAT ARE EMBEDDINGS?
// - Embeddings are arrays of numbers that represent the "meaning" of text
// - Similar text has similar numbers (vectors close together in space)
// - Example: "Apple iPhone" and "Samsung Galaxy" have similar embeddings
//
// WHY JINA AI?
// - Specialized in embeddings (better than general-purpose models)
// - Supports asymmetric search (different optimization for queries vs documents)
// - Fast API response (~200ms)
// - 2048-dimensional vectors (good balance of accuracy and speed)
//
// INTERVIEW TIP: Explain the difference between embeddings and keywords
// - Keywords: Exact match only ("iPhone" won't match "Apple phone")
// - Embeddings: Semantic match ("iPhone" matches "Apple phone", "iOS device")
// ============================================================================

import axios from "axios";
import { JINA_API_KEY } from "../config/env.js";

// ============================================================================
// FUNCTION: embedTextWithJina
// ============================================================================
// PURPOSE: Convert text into a 2048-dimensional vector using Jina AI
//
// PARAMETERS:
// - text: The text to embed (e.g., "What's the latest tech news?")
// - task: Optimization mode (default: "retrieval.query")
//   * "retrieval.query" - Optimize for search queries (user questions)
//   * "retrieval.passage" - Optimize for documents (articles)
//
// WHY TWO DIFFERENT TASKS?
// - Asymmetric search improves accuracy by 15-20%
// - Queries are short ("latest news") vs documents are long (full articles)
// - Jina optimizes the embedding differently for each
//
// RETURN VALUE:
// - Array of 2048 numbers (floats between -1 and 1)
// - Example: [0.234, -0.567, 0.123, ..., 0.891] (2048 total)
//
// EXAMPLE USAGE:
// const queryVector = await embedTextWithJina("latest tech news", "retrieval.query");
// const articleVector = await embedTextWithJina("Apple releases iPhone 16...", "retrieval.passage");
//
// INTERVIEW TIP: Mention that we use different tasks for indexing vs searching
// ============================================================================
export async function embedTextWithJina(text, task = "retrieval.query") {
    // Safety check: Make sure API key is configured
    if (!JINA_API_KEY) {
        throw new Error("JINA_API_KEY not configured");
    }

    // Make HTTP POST request to Jina AI API
    const resp = await axios.post(
        "https://api.jina.ai/v1/embeddings",  // Jina AI endpoint
        {
            model: "jina-embeddings-v4",       // Latest model (2048 dimensions)
            task,                               // "retrieval.query" or "retrieval.passage"
            input: [{ text }],                  // Text to embed (array format)
        },
        {
            headers: {
                Authorization: `Bearer ${JINA_API_KEY}`,  // API authentication
                "Content-Type": "application/json",
            },
            timeout: 20000,  // 20 second timeout (embeddings are usually fast ~200ms)
        }
    );

    // Extract the embedding from the response
    // Response structure: { data: [{ embedding: [...] }] }
    const embedding = resp.data?.data?.[0]?.embedding;

    // Safety check: Make sure we got a valid embedding
    if (!embedding) throw new Error("No embedding returned from Jina");

    // Return the 2048-dimensional vector
    return embedding;
    // Example return: [0.234, -0.567, 0.123, ..., 0.891] (2048 numbers)
}

// ============================================================================
// INTERVIEW TALKING POINTS:
// ============================================================================
// 1. "Embeddings convert text to numbers so computers can understand meaning"
// 2. "We use 2048 dimensions - higher = more accurate but slower"
// 3. "Asymmetric embeddings (different for queries vs documents) improve accuracy"
// 4. "Jina AI specializes in embeddings, unlike general models like GPT"
// 5. "Cosine similarity measures how 'close' two embeddings are (0-1 score)"
//
// COMMON INTERVIEW QUESTIONS:
// Q: Why not use keyword search?
// A: Keywords miss semantic matches. "iPhone" won't match "Apple phone" with keywords,
//    but embeddings understand they're related.
//
// Q: Why 2048 dimensions?
// A: Balance between accuracy and speed. More dimensions = more accurate but slower.
//    Jina v4 uses 2048 as optimal for most use cases.
//
// Q: What's the difference between query and passage embeddings?
// A: Queries are short and specific, passages are long and detailed.
//    Jina optimizes differently for each to improve search accuracy.
// ============================================================================
