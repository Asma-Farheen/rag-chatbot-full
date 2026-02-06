import dotenv from "dotenv";
dotenv.config();

export const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 3001);

// Keys & config (local-friendly defaults)
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const JINA_API_KEY = process.env.JINA_API_KEY || "";
export const QDRANT_URL =
    process.env.QDRANT_URL ||
    `http://${process.env.QDRANT_HOST || "localhost"}:${process.env.QDRANT_PORT || 6333}`;
export const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || "news_articles";
export const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

export const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL) || 600;
export const SESSION_TTL = Number(process.env.SESSION_TTL) || 3600;

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const REDIS_URL =
    process.env.REDIS_URL ||
    `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`;

// Basic validation (warn locally rather than hard exit so you can iterate)
if (!GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY not set in .env — Gemini calls will fail.");
}
if (!JINA_API_KEY) {
    console.warn("⚠️ JINA_API_KEY not set in .env — Jina embedding calls will fail.");
}
