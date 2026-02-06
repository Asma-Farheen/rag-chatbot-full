// ============================================================================
// GEMINI AI CLIENT - Large Language Model for Answer Generation
// ============================================================================
// PURPOSE: Generate human-like answers based on retrieved article context
//
// WHAT IS GEMINI?
// - Google's large language model (LLM) - similar to ChatGPT
// - Can understand context and generate coherent text
// - Model: gemini-2.0-flash-exp (fast, cost-effective)
//
// WHY GEMINI?
// - Fast response time (~1-2 seconds)
// - Good at following instructions (stays within context)
// - Free tier available for development
// - Supports structured prompts
//
// HOW IT FITS INTO RAG:
// 1. Qdrant finds relevant articles (Retrieval)
// 2. We format articles as context (Augmentation)
// 3. Gemini generates answer from context (Generation)
//
// INTERVIEW TIP: This is the "G" in RAG - Generation
// ============================================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../config/env.js";

// Global Gemini model instance (initialized once, reused for all requests)
let answerModel = null;

// ============================================================================
// FUNCTION: initGemini
// ============================================================================
// PURPOSE: Initialize the Gemini AI model (called on server startup)
//
// WHY INITIALIZE SEPARATELY?
// - Checks if API key is configured before accepting requests
// - Reuses the same model instance (more efficient)
// - Graceful fallback if Gemini is not configured
//
// CALLED FROM: server.js during startup
// ============================================================================
export function initGemini() {
    if (GEMINI_API_KEY) {
        try {
            // Create Gemini AI client
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

            // Get the specific model we want to use
            // gemini-2.0-flash-exp = Fast, cost-effective, good for production
            answerModel = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        } catch (err) {
            console.warn("Could not initialize Gemini model:", err?.message || err);
            answerModel = null;
        }
    }
    return answerModel;
}

// ============================================================================
// FUNCTION: getGeminiModel
// ============================================================================
// PURPOSE: Get the initialized Gemini model (for use in other files)
// ============================================================================
export function getGeminiModel() {
    return answerModel;
}

// ============================================================================
// FUNCTION: generateAnswerWithGemini
// ============================================================================
// PURPOSE: Generate a factual answer based on provided article context
//
// PARAMETERS:
// - query: User's question (e.g., "What's the latest tech news?")
// - context: Formatted articles from buildContextFromPoints()
//
// THE PROMPT ENGINEERING:
// We carefully craft the prompt to:
// 1. Define the AI's role (news chatbot)
// 2. Constrain it to use ONLY the provided context
// 3. Specify the output format (3-6 sentences, neutral tone)
// 4. Handle edge cases (say "not sure" if answer not in context)
//
// WHY THIS MATTERS:
// - Without constraints, AI might hallucinate (make up facts)
// - Specific instructions improve answer quality
// - Consistent format makes UI predictable
//
// EXAMPLE:
// Input:
//   query: "What did Apple announce?"
//   context: "### Apple iPhone 16\nApple released iPhone 16 with AI features..."
// Output:
//   "Based on recent articles, Apple announced the iPhone 16 with new AI features..."
//
// INTERVIEW TIP: This is called "prompt engineering" - a key skill in AI development
// ============================================================================
export async function generateAnswerWithGemini(query, context) {
    // Fallback: If Gemini is not configured, return a helpful error message
    if (!answerModel) {
        return "Sorry — the LLM model is not configured on this machine.";
    }

    // Construct the prompt with clear instructions
    // This is the "secret sauce" that makes RAG work well
    const prompt = `
You are a news chatbot using Retrieval-Augmented Generation.

Use ONLY the context below to answer the user's question. 
If the answer is not clearly in the context, say you are not sure.

Context:
${context}

User question: ${query}

Answer in 3–6 concise sentences, neutral and factual.
`;

    // Call Gemini API to generate the answer
    const result = await answerModel.generateContent({
        contents: [
            {
                role: "user",              // We're sending a user message
                parts: [{ text: prompt }], // The full prompt with context
            },
        ],
    });

    // Extract the text from Gemini's response
    // Handle different response formats gracefully
    try {
        return result.response.text();
    } catch {
        // Fallback if text() method fails
        return String(result?.response || result);
    }
}

// ============================================================================
// INTERVIEW TALKING POINTS:
// ============================================================================
// 1. "We use prompt engineering to constrain the AI to only use provided context"
// 2. "Gemini 2.0 Flash is optimized for speed and cost-effectiveness"
// 3. "The prompt explicitly tells AI to say 'not sure' if answer isn't in context"
// 4. "We specify output format (3-6 sentences) for consistent UX"
// 5. "This is the 'Generation' part of RAG - creating human-readable answers"
//
// COMMON INTERVIEW QUESTIONS:
// Q: Why not just use Gemini without RAG?
// A: Without RAG, Gemini might hallucinate (make up facts). RAG grounds
//    answers in real data, making them factual and verifiable.
//
// Q: What's prompt engineering?
// A: The art of crafting prompts to get desired AI behavior. Good prompts
//    specify role, constraints, format, and edge case handling.
//
// Q: Why Gemini instead of GPT?
// A: Gemini 2.0 Flash is faster and cheaper than GPT-4, with similar quality
//    for our use case. Also, Google offers generous free tier.
//
// Q: How do you prevent hallucinations?
// A: 1) Explicitly instruct AI to use ONLY provided context
//    2) Tell it to say "not sure" if answer not in context
//    3) Keep context focused (top 5 articles only)
//
// Q: What if Gemini API is down?
// A: We have a graceful fallback message. In production, we'd add retry logic
//    and possibly a backup model (e.g., GPT-4 as fallback).
// ============================================================================
