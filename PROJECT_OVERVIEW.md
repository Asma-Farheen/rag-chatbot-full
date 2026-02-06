# 📦 RAG Chatbot - Complete Project Overview

## 🔢 Technology Versions

### Frontend
- **React**: 19.2.0
- **Vite**: 7.2.2
- **Sass**: 1.94.2
- **Node.js**: 18+ (for build)

### Backend
- **Node.js**: 20
- **Express**: 4.21.2
- **Google Gemini AI**: 0.11.5
- **Qdrant Client**: 1.16.0
- **Redis Client**: 4.7.1
- **Axios**: 1.13.2

### Infrastructure (Docker)
- **Redis**: 7.2-alpine
- **Qdrant**: latest
- **Nginx**: (for frontend serving)

---

## 🏗️ Project Structure & Storage

```
📦 RAG Chatbot
│
├─ 📁 frontend/                    → React UI (Port 8080)
│  ├─ src/
│  │  ├─ main.jsx                 → Entry point
│  │  ├─ App.jsx                  → Root component
│  │  ├─ ChatPage.jsx             → Main chat interface
│  │  └─ ChatPage.scss            → Styles
│  ├─ Dockerfile                  → Frontend build image
│  └─ package.json                → Dependencies
│
├─ 📁 backend/                     → Node.js API (Port 3000)
│  ├─ src/
│  │  ├─ server.js               → Entry point
│  │  ├─ app.js                  → Express config
│  │  ├─ routes/                 → API endpoints
│  │  ├─ controllers/            → Request handlers
│  │  ├─ services/               → Business logic
│  │  │  ├─ chatService.js      → Conversation manager
│  │  │  └─ ragService.js       → RAG pipeline (CORE)
│  │  ├─ utils/                  → External API clients
│  │  │  ├─ jinaClient.js       → Embeddings
│  │  │  ├─ qdrantClient.js     → Vector search
│  │  │  └─ geminiClient.js     → AI answers
│  │  ├─ config/env.js           → Configuration
│  │  ├─ redisClient.js          → Cache connection
│  │  └─ sessionStore.js         → Session management
│  ├─ ingest.js                  → Data loader (one-time)
│  ├─ news_articles.json         → Source data (20 articles)
│  ├─ Dockerfile                 → Backend build image
│  └─ package.json               → Dependencies
│
└─ docker-compose.yml             → Orchestrates all services
```

---

## 💾 What's Stored Where

| Data Type | Storage | Location | Persistence |
|-----------|---------|----------|-------------|
| **Chat History** | Redis | `session:{sessionId}:messages` | 1 hour TTL |
| **RAG Cache** | Redis | `rag:news:{query}` | 1 hour TTL |
| **News Embeddings** | Qdrant | Collection: `news_articles` | Permanent (volume) |
| **Session ID** | Browser | `localStorage.sessionId` | Until cleared |
| **API Keys** | Backend | `.env` file | Permanent |
| **Source Articles** | Backend | `news_articles.json` | Permanent |

---

## 🔄 Complete Code Flow (Short Version)

### 1️⃣ **One-Time Setup** (Before first use)
```
Run: node ingest.js
  ↓
Read news_articles.json (20 articles)
  ↓
For each article:
  → Jina AI: Convert text to embedding (2048 numbers)
  → Qdrant: Store embedding + article
  ↓
✅ Qdrant ready with searchable articles
```

### 2️⃣ **Server Startup**
```
Run: npm start (backend) + npm run dev (frontend)
  ↓
server.js → Connect to Redis, Qdrant, Gemini
  ↓
app.js → Setup Express + routes
  ↓
✅ Backend listening on port 3000
✅ Frontend on port 8080
```

### 3️⃣ **User Query Flow** (Main Journey)
```
👤 User types: "What's the latest tech news?"
  ↓
📱 ChatPage.jsx → handleSend()
  ↓
🌐 POST /api/chat → Backend
  ↓
🎯 apiRoutes.js → chatController.js → chatService.js
  ↓
🧠 ragService.js (THE CORE):
  1. Check Redis cache → If found, return ✅
  2. Jina AI: Embed query → [0.234, -0.567, ...]
  3. Qdrant: Search similar articles → Top 5 matches
  4. Format articles as context
  5. Gemini AI: Generate answer from context
  6. Save to Redis cache
  ↓
💾 Save chat history to Redis
  ↓
📤 Return response to frontend
  ↓
✨ ChatPage.jsx: Typing animation (5ms per character)
  ↓
👤 User sees answer appear character-by-character
```

---

## 🎯 Key Files & Their Jobs

| File | Purpose | When It Runs |
|------|---------|--------------|
| **server.js** | Start backend, connect services | Server startup |
| **ChatPage.jsx** | UI, user interaction, typing animation | Browser |
| **ragService.js** | RAG pipeline (embed → search → generate) | Every query |
| **jinaClient.js** | Convert text to embeddings | Every query + ingestion |
| **qdrantClient.js** | Vector similarity search | Every query + ingestion |
| **geminiClient.js** | Generate AI answers | Every query |
| **redisClient.js** | Cache & session storage | Every query |
| **ingest.js** | Load articles into Qdrant | One-time setup |

---

## 🐳 Docker Build Process

### How It's Built:
```bash
# Build all images
docker-compose build

# What happens:
1. Backend Dockerfile:
   - FROM node:20
   - Copy package.json → npm install
   - Copy source code
   - CMD: node src/server.js

2. Frontend Dockerfile:
   - FROM node:18 (build stage)
   - npm install + npm run build
   - FROM nginx (serve stage)
   - Copy build files to nginx
   - CMD: nginx

3. Pull Redis & Qdrant images from Docker Hub
```

### How It Runs:
```bash
docker-compose up

# Creates:
- redis_cache (port 6379)
- qdrant_vector_db (port 6333)
- rag_chatbot_backend (port 3000)
- rag_chatbot_frontend (port 8080)
- trail4-network (connects all)
```

---

## 📊 Data Flow Diagram

```
┌──────────────┐
│   Browser    │
│ (localStorage│  Stores: sessionId
│  ChatPage)   │
└──────┬───────┘
       │ HTTP
       ↓
┌──────────────┐
│   Backend    │
│  (Express)   │  Port 3000
└──────┬───────┘
       │
       ├─→ Redis (Cache + Sessions)
       │   - Chat history: 1hr TTL
       │   - RAG cache: 1hr TTL
       │
       ├─→ Qdrant (Vector DB)
       │   - 20 news articles
       │   - Embeddings (2048 dims)
       │
       ├─→ Jina AI (API)
       │   - Text → Embeddings
       │
       └─→ Gemini AI (API)
           - Context → Answer
```

---

## 🚀 Deployment (AWS EC2)

### What's Deployed:
- **Platform**: AWS EC2 (Amazon Linux 2023)
- **Method**: Docker Compose
- **Access**: Public IP + Port 8080
- **Persistence**: Qdrant volume mounted

### Deployment Steps:
```bash
1. SSH to EC2
2. Clone repo
3. Create .env with API keys
4. docker-compose up -d
5. Access: http://<EC2-IP>:8080
```

---

## 🎨 React Features Used

| Feature | Where | Purpose |
|---------|-------|---------|
| **useState** | ChatPage.jsx | messages, input, loading, error, sessionId |
| **useEffect** | ChatPage.jsx | Load session, fetch history, auto-scroll |
| **useRef** | ChatPage.jsx | Auto-scroll to bottom (no re-render) |
| **localStorage** | ChatPage.jsx | Persist sessionId across refreshes |
| **Fetch API** | ChatPage.jsx | HTTP requests to backend |
| **Recursive setTimeout** | ChatPage.jsx | Typing animation effect |

---

## 💡 Key Design Decisions

### Why This Architecture?

1. **Modular Backend** → Easy to test, maintain, scale
2. **Redis Cache** → Fast responses for repeated queries
3. **Session Persistence** → Chat survives page refresh
4. **Typing Animation** → Better UX, feels natural
5. **Docker** → Consistent deployment anywhere
6. **RAG Pattern** → Accurate answers from source data

### Performance Optimizations:

- ✅ Redis caching (1hr TTL)
- ✅ Optimistic UI updates
- ✅ Docker multi-stage builds
- ✅ Nginx for static files
- ✅ Connection pooling (Redis)

---

## 📝 Quick Commands

```bash
# Development
cd backend && npm run dev        # Backend with hot reload
cd frontend && npm run dev       # Frontend dev server

# Production (Docker)
docker-compose up -d             # Start all services
docker-compose down              # Stop all services
docker-compose logs -f backend   # View backend logs

# Data Ingestion
cd backend && node ingest.js     # Load articles to Qdrant

# Build
cd frontend && npm run build     # Production build
```

---

## 🎯 Interview Quick Facts

- **Total Files**: ~20 backend files, ~5 frontend files
- **Main Language**: JavaScript (ES Modules)
- **API Endpoints**: 3 (chat, history, clear)
- **External APIs**: 2 (Jina AI, Gemini AI)
- **Databases**: 2 (Redis, Qdrant)
- **Deployment**: AWS EC2 + Docker
- **Build Time**: ~2 minutes
- **Response Time**: <2s (cached), <5s (uncached)

---

**🚀 This is your complete RAG chatbot in one page!**
