// backend/ingest.js
import dotenv from "dotenv";
import axios from "axios";
import { QdrantClient } from "@qdrant/js-client-rest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JINA_API_KEY = process.env.JINA_API_KEY;

if (!JINA_API_KEY) {
  console.error("❌ JINA_API_KEY missing");
  process.exit(1);
}

// ------------------------
// Load news_articles.json
// ------------------------
const articlesPath = path.join(__dirname, "news_articles.json");
if (!fs.existsSync(articlesPath)) {
  console.error("❌ news_articles.json not found in backend folder.");
  process.exit(1);
}

const ARTICLES = JSON.parse(fs.readFileSync(articlesPath, "utf-8"));

const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || "news_articles";
const QDRANT_URL = process.env.QDRANT_URL || `http://${process.env.QDRANT_HOST}:${process.env.QDRANT_PORT}`;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

const qdrant = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
});

// Jina Embedding function
async function embed(text) {
  const response = await axios.post(
    "https://api.jina.ai/v1/embeddings",
    {
      model: "jina-embeddings-v4",
      task: "retrieval.passage",
      input: [{ text }],
    },
    {
      headers: {
        Authorization: `Bearer ${JINA_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.data[0].embedding;
}

async function main() {
  console.log(`📥 Found ${ARTICLES.length} articles.`);
  console.log("⚙️ Creating or recreating Qdrant collection...");

  await qdrant.recreateCollection(QDRANT_COLLECTION, {
    vectors: {
      size: 2048,
      distance: "Cosine",
    },
  });

  console.log("📌 Qdrant collection ready.");

  const points = [];

  for (const a of ARTICLES) {
    console.log(`Embedding: ${a.title}`);
    const vector = await embed(a.text);

    points.push({
      id: a.id,
      vector,
      payload: a
    });
  }

  console.log("⬆️ Uploading embeddings...");
  await qdrant.upsert(QDRANT_COLLECTION, { points });

  console.log("✅ Ingestion complete!");
  process.exit(0);
}

main();
