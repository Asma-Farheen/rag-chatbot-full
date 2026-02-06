// backend/src/services/geminiService.js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

/**
 * Calls the Gemini API to generate a final, contextual answer.
 * @param {string} systemPrompt - The full RAG prompt containing context and history.
 * @returns {Promise<string>} - The bot's generated text response.
 */
export async function callGeminiAPI(systemPrompt) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            config: {
                // Set system instruction here
                systemInstruction: "You are a helpful and concise RAG-powered news chatbot. Your responses MUST be based ONLY on the provided context. If the context is insufficient, politely state that you cannot answer.",
                temperature: 0.2,
            }
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API:", error.response?.data || error.message);
        throw new Error("Failed to get response from Gemini.");
    }
}