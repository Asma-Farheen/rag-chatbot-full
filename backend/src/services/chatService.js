// ============================================================================
// CHAT SERVICE - Manages Conversation History and Orchestrates RAG
// ============================================================================
// PURPOSE: This service handles the conversation flow and session management
//
// KEY RESPONSIBILITIES:
// 1. Load previous conversation history from Redis
// 2. Add new user message to history
// 3. Get AI response using RAG
// 4. Add AI response to history
// 5. Save updated history back to Redis
//
// WHY SEPARATE FROM RAG SERVICE?
// - Separation of concerns: RAG handles retrieval, Chat handles conversation
// - Makes testing easier (can test RAG without sessions)
// - Allows different conversation strategies (multi-turn, single-turn, etc.)
//
// INTERVIEW TIP: This demonstrates the "Service Layer" pattern
// ============================================================================

import { getSessionHistory, saveSessionHistory, clearSessionHistory } from "../sessionStore.js";
import { runRagQuery } from "./ragService.js";
import { SESSION_TTL } from "../config/env.js";

// ============================================================================
// FUNCTION: processChat - Main conversation handler
// ============================================================================
// PURPOSE: Process a user message and return AI response with full history
//
// FLOW:
// 1. Load conversation history (e.g., previous 5 messages)
// 2. Append user's new message
// 3. Get AI answer using RAG
// 4. Append AI's response
// 5. Save updated history to Redis
// 6. Return everything to frontend
//
// WHY THIS APPROACH?
// - Maintains conversation context across page refreshes
// - Allows multi-turn conversations (future feature)
// - Provides audit trail of all interactions
//
// EXAMPLE:
// Input: sessionId="507003", userMessage="What's the latest news?"
// Output: {
//   sessionId: "507003",
//   answer: "Based on recent articles...",
//   history: [
//     { role: "user", content: "Hello" },
//     { role: "assistant", content: "Hi! How can I help?" },
//     { role: "user", content: "What's the latest news?" },
//     { role: "assistant", content: "Based on recent articles..." }
//   ],
//   sources: [...],
//   cached: false
// }
// ============================================================================
export async function processChat(sessionId, userMessage) {
    // STEP 1: Load previous conversation history from Redis
    // If no history exists (new session), default to empty array
    const history = (await getSessionHistory(sessionId)) || [];
    // Example: [{ role: "user", content: "Hello" }, { role: "assistant", content: "Hi!" }]

    // STEP 2: Add the user's new message to the conversation
    history.push({ role: "user", content: userMessage });
    // Now: [...previous messages, { role: "user", content: "What's the latest news?" }]

    // STEP 3: Run the RAG query to get the AI's answer
    // This calls ragService.js which handles: cache → embed → search → generate
    const { answer, sources, cached } = await runRagQuery(userMessage);
    // Result: { answer: "Based on recent articles...", sources: [...], cached: false }

    // STEP 4: Add the AI's response to the conversation
    history.push({ role: "assistant", content: answer });
    // Now: [...previous messages, user message, { role: "assistant", content: "Based on..." }]

    // STEP 5: Save the updated conversation history back to Redis
    // SESSION_TTL determines how long the history persists (default: 1 hour)
    await saveSessionHistory(sessionId, history, SESSION_TTL);
    // Redis key: "session:507003:messages" → expires after 1 hour

    // STEP 6: Return everything to the frontend
    // The frontend uses this to update the UI
    return { sessionId, answer, history, sources, cached };
}

// ============================================================================
// FUNCTION: getHistory - Retrieve conversation history
// ============================================================================
// PURPOSE: Get all previous messages for a session (used when page loads)
//
// USE CASE:
// - User refreshes the page
// - Frontend calls GET /api/session/:id/history
// - This function retrieves the saved conversation from Redis
// - Frontend displays the previous messages
//
// WHY NEEDED?
// - Provides conversation persistence across page refreshes
// - Allows users to continue where they left off
// - Better UX than losing conversation on refresh
// ============================================================================
export async function getHistory(sessionId) {
    // Load history from Redis, return empty array if none exists
    return (await getSessionHistory(sessionId)) || [];
}

// ============================================================================
// FUNCTION: clearHistory - Delete conversation history
// ============================================================================
// PURPOSE: Clear all messages for a session (used for "Reset Session" button)
//
// USE CASE:
// - User clicks "Reset Session" button
// - Frontend calls POST /api/session/:id/clear
// - This function deletes the Redis key
// - User starts fresh with a new conversation
//
// WHY NEEDED?
// - Allows users to start over without creating a new session ID
// - Useful for testing or when conversation goes off-track
// - Saves Redis memory by deleting unused data
// ============================================================================
export async function clearHistory(sessionId) {
    // Delete the Redis key: "session:507003:messages"
    await clearSessionHistory(sessionId);

    // Return confirmation
    return { sessionId, cleared: true };
}

// ============================================================================
// INTERVIEW TALKING POINTS:
// ============================================================================
// 1. "We use Redis for session storage because it's fast and handles expiration automatically"
// 2. "Each session gets a unique 6-digit ID stored in browser localStorage"
// 3. "History persists for 1 hour (SESSION_TTL) to balance UX and memory usage"
// 4. "The service layer pattern separates business logic from API routes"
// 5. "We could extend this to support multi-turn context (passing history to AI)"
// ============================================================================
