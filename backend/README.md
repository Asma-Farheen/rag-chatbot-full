# Voosh News Chatbot — Backend (RAG Pipeline)

This backend powers the RAG-based News Chatbot built for the Voosh Full Stack Developer Assignment.

It uses a Retrieval Augmented Generation pipeline with **Jina Embeddings** → **Qdrant Vector Search** → **Gemini Flash** to answer questions from ingested news articles.

---

## 🚀 Tech Stack
* **Node.js + Express**
* **Qdrant** (Vector DB)
* **Jina Embeddings v4**
* **Google Gemini Flash**
* **Redis** (Session + Chat History)
* **Docker** for Redis & Qdrant

---

## 📁 Project Structure
backend/ ├── src/
            ├── services/
            |           ├── geminiService.js # API server 
            |           ├── qdrantService.js # API server
            |           ├── redisService.js # API server
            ├── redisClient.js # API server 
            ├── server.js # API server
            ├── sessionStore.js # API server
         ├── .env # API keys + environment config 
         ├── Dockerfile
         ├── ingest.js # Embeds 50 news articles + upload to Qdrant 
         ├── news_articles.json # News dataset 
         ├── package-lock.json 
         ├── package.json 
         └── README.md

---

## 🔑 Environment Variables (`.env`)

Create `.env` inside `/backend`:

```env
GEMINI_API_KEY=your_key_here
JINA_API_KEY=your_key_here
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_COLLECTION=news_articles
REDIS_HOST=localhost
REDIS_PORT=6379
BACKEND_PORT=3001
SESSION_TTL=3600

⚙️ Setup Instructions
     Note: These steps assume you have Docker installed and running.

1️⃣ Install dependencies

Bash
 npm install

2️⃣ Start Qdrant

Bash
docker run -p 6333:6333 qdrant/qdrant

3️⃣ Start Redis

Bash
docker run --name redis -p 6379:6379 -d redis

4️⃣ Ingest the news articles This embeds all articles using Jina and stores vectors in Qdrant.

Bash
node ingest.js

5️⃣ Start the backend server

Bash
npm run dev

Backend will run at: http://localhost:3001

🔍 RAG Flow Overview
1.User sends a question → /api/chat
2.Jina Embeddings converts question → vector
3.Vector is passed to Qdrant → retrieves top-k relevant news articles
4.Backend builds a context block
5.Context + Query → sent to Gemini Flash
6.Gemini generates answer
7.Answer + user message stored in Redis session history

📡 API Endpoints

Endpoint	               Method	      Description	        Body Example
/health	                   GET	          Health Check	        N/A
/api/chat	               POST	          Send chat mes             
/api/session/:id/history   GET	          Get session history   N/A
/api/session/:id/clear	   POST	          Clear session	        N/A


🧠 Redis Session Storage

*Key format: session:<sessionId>:messages
*Value example:
JSON ---
[
  { "role": "user", "content": "Hi" },
  { "role": "assistant", "content": "Hello! What would you like to know?" }
]

Use Redis CLI:

Bash
docker exec -it redis redis-cli
KEYS session:*
GET session:123456:messages