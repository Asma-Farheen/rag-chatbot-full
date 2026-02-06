# 🚀 Deployment Guide: How to Publish Your Chatbot

To make your RAG Chatbot run "out of your laptop like any other website" (accessible 24/7 via a public URL), you need to **Deploy** it to the cloud.

Because your app is complex (Frontend + Backend + Database + Cache), you cannot just upload it to one place. You need to connect a few services.

Here is the **Best Free-Tier Strategy** for this project:

---

## 🏗️ The Architecture
1.  **Frontend (React)**: Hosted on **Vercel** (Free).
2.  **Backend (Node.js)**: Hosted on **Render** (Free).
3.  **Vector DB (Qdrant)**: Hosted on **Qdrant Cloud** (Free Tier).
4.  **Cache (Redis)**: Hosted on **Upstash** (Free Tier).

---

## 🛠️ Step-by-Step Instructions

### Phase 1: The Databases (Remote Storage)
*Your code can't connect to `localhost` anymore. It needs databases that live on the internet.*

1.  **Setup Redis (Upstash)**
    *   Go to [Upstash.com](https://upstash.com/) and create a free Redis database.
    *   **Save these details**: `REDIS_HOST` (e.g., `us1-redis.upstash.io`), `REDIS_PORT`, and `REDIS_PASSWORD`.

2.  **Setup Qdrant (Vector DB)**
    *   Go to [cloud.qdrant.io](https://cloud.qdrant.io/) and create a free tier cluster.
    *   **Get the API Key** and **Cluster URL** (e.g., `https://xyz-example.qdrant.tech`).
    *   **Save these details**: `QDRANT_HOST` (the URL) and `QDRANT_API_KEY`.

3.  **Upload Your Data**
    *   You need to run your `ingest.js` script *locally* on your laptop, but point it to the *Cloud Qdrant* so it uploads the news articles there.
    *   Update your local `.env` temporarily with the new Cloud Qdrant details and run `node ingest.js`.

### Phase 2: The Backend (Render.com)
1.  Push your code to **GitHub**.
2.  Go to [Render.com](https://render.com/) -> New + -> **Web Service**.
3.  Connect your GitHub repo.
4.  **Root Directory**: `backend`
5.  **Build Command**: `npm install`
6.  **Start Command**: `node src/server.js`
7.  **Environment Variables**: Add all your keys here!
    *   `GEMINI_API_KEY`: (Your Google Key)
    *   `JINA_API_KEY`: (Your Jina Key)
    *   `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`: (From Upstash)
    *   `QDRANT_HOST`, `QDRANT_API_KEY`: (From Qdrant Cloud)
    *   `PORT`: `10000` (Render default)
8.  Deploy! You will get a URL like: `https://rag-chatbot-backend.onrender.com`.

### Phase 3: The Frontend (Vercel)
1.  Go to [Vercel.com](https://vercel.com/) -> Add New Project.
2.  Connect the same GitHub repo.
3.  **Framework Preset**: Vite.
4.  **Root Directory**: Edit this and select `frontend`.
5.  **Environment Variables**:
    *   `VITE_BACKEND_URL`: `https://rag-chatbot-backend.onrender.com` (The URL you got from Render).
6.  Deploy!

---

## ⚡ Quick Alternative: "The Tunnel" (Temporary)
If you just want to show a friend **right now** and don't care if it stops working when you close your laptop:

1.  Stop the current frontend server (Ctrl+C).
2.  Run this command in the frontend terminal:
    ```bash
    npx localtunnel --port 5173
    ```
3.  It will give you a public URL (e.g., `https://floppy-dog-42.loca.lt`).
4.  WARNING: You also need to tunnel the backend OR ensure your frontend can still reach your local IP, which `localtunnel` often struggles with due to mixed contents (HTTPS vs HTTP).
    *   *The Cloud Deployment (Steps 1-3) is highly recommended instead.*
