# 🔧 Quick Changes Guide - For Live Interviews

## 🎯 Common Interview Requests & How to Change Them

This guide shows you **exactly where to make changes** if an interviewer asks you to modify something.

---

## 📝 **Table of Contents**

1. [Change Number of Articles Retrieved](#1-change-number-of-articles-retrieved)
2. [Change Cache Duration (TTL)](#2-change-cache-duration-ttl)
3. [Change AI Model](#3-change-ai-model)
4. [Change Embedding Dimensions](#4-change-embedding-dimensions)
5. [Add Rate Limiting](#5-add-rate-limiting)
6. [Change Similarity Metric](#6-change-similarity-metric)
7. [Add Source Citations to UI](#7-add-source-citations-to-ui)
8. [Change Typing Animation Speed](#8-change-typing-animation-speed)
9. [Add Multi-Turn Context](#9-add-multi-turn-context)
10. [Change Session ID Length](#10-change-session-id-length)

---

## 1. Change Number of Articles Retrieved

**Interview Question:** "Can you retrieve more/fewer articles?"

### **File:** `backend/src/services/ragService.js`

**Find this line (around line 145):**
```javascript
const points = await searchQdrant(vector, 5);
```

**Change to:**
```javascript
const points = await searchQdrant(vector, 10);  // Now retrieves 10 articles
```

**Why you might change this:**
- More articles = More context, but slower response
- Fewer articles = Faster, but might miss context
- Sweet spot: 3-5 for most queries

---

## 2. Change Cache Duration (TTL)

**Interview Question:** "How would you change how long cache lasts?"

### **File:** `backend/src/config/env.js`

**Find this line:**
```javascript
export const CACHE_TTL_SECONDS = 3600; // 1 hour
```

**Change to:**
```javascript
export const CACHE_TTL_SECONDS = 1800;  // 30 minutes
// OR
export const CACHE_TTL_SECONDS = 7200;  // 2 hours
```

**Why you might change this:**
- Shorter TTL = Fresher data, more API calls
- Longer TTL = Better performance, stale data
- For news: 30-60 minutes is good

---

## 3. Change AI Model

**Interview Question:** "Can you use a different Gemini model?"

### **File:** `backend/src/config/env.js`

**Find this line:**
```javascript
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
```

**Change to:**
```javascript
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro";
// Options:
// - "gemini-2.0-flash-exp" (fastest, cheapest)
// - "gemini-1.5-pro" (more accurate, slower)
// - "gemini-1.5-flash" (balanced)
```

**Why you might change this:**
- Flash = Fast, cheap, good for production
- Pro = More accurate, better reasoning, expensive
- Depends on budget vs quality tradeoff

---

## 4. Change Embedding Dimensions

**Interview Question:** "What if you wanted to use different embeddings?"

### **File:** `backend/ingest.js`

**Find this section (around line 42):**
```javascript
await qdrant.recreateCollection(QDRANT_COLLECTION, {
  vectors: {
    size: 2048,      // Jina v4 uses 2048 dimensions
    distance: "Cosine",
  },
});
```

**Change to:**
```javascript
await qdrant.recreateCollection(QDRANT_COLLECTION, {
  vectors: {
    size: 1536,      // OpenAI embeddings use 1536
    distance: "Cosine",
  },
});
```

**Also change in:** `backend/src/utils/jinaClient.js`
```javascript
// If switching to OpenAI embeddings
import OpenAI from "openai";

export async function embedTextWithOpenAI(text) {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
    });
    return response.data[0].embedding;
}
```

**Why you might change this:**
- Different models have different dimensions
- More dimensions = More accurate but slower
- Less dimensions = Faster but less accurate

---

## 5. Add Rate Limiting

**Interview Question:** "How would you prevent abuse?"

### **File:** `backend/src/middleware/rateLimiter.js` (CREATE NEW FILE)

```javascript
import { redisClient } from "../redisClient.js";

export async function rateLimiter(req, res, next) {
    const sessionId = req.body.sessionId || req.ip;
    const key = `rate:${sessionId}`;
    
    // Get current request count
    const count = await redisClient.incr(key);
    
    // Set expiration on first request
    if (count === 1) {
        await redisClient.expire(key, 60); // 1 minute window
    }
    
    // Allow 10 requests per minute
    if (count > 10) {
        return res.status(429).json({ 
            error: "Too many requests. Please try again later." 
        });
    }
    
    next();
}
```

### **File:** `backend/src/routes/apiRoutes.js`

**Add this:**
```javascript
import { rateLimiter } from "../middleware/rateLimiter.js";

// Add before chat route
router.post("/chat", rateLimiter, handleChat);
```

**Why you might add this:**
- Prevents spam/abuse
- Protects API costs
- Improves system stability

---

## 6. Change Similarity Metric

**Interview Question:** "What if you wanted to use Euclidean distance instead?"

### **File:** `backend/ingest.js`

**Find this section:**
```javascript
await qdrant.recreateCollection(QDRANT_COLLECTION, {
  vectors: {
    size: 2048,
    distance: "Cosine",  // ← Change this
  },
});
```

**Change to:**
```javascript
await qdrant.recreateCollection(QDRANT_COLLECTION, {
  vectors: {
    size: 2048,
    distance: "Euclid",  // Options: "Cosine", "Euclid", "Dot"
  },
});
```

**Why you might change this:**
- **Cosine:** Best for text (semantic meaning)
- **Euclidean:** Best for coordinates/spatial data
- **Dot Product:** Fast but less accurate

---

## 7. Add Source Citations to UI

**Interview Question:** "Can you show which articles were used?"

### **File:** `frontend/src/ChatPage.jsx`

**Find the message rendering section (around line 150):**
```javascript
{messages.map((msg, idx) => (
    <div key={idx} className={`message-bubble ${msg.role === "user" ? "message-bubble--user" : "message-bubble--bot"}`}>
        <div className="message-label">{msg.role === "user" ? "You" : "Bot"}</div>
        <div className="message-content">{msg.content}</div>
        
        {/* ADD THIS: Show sources for bot messages */}
        {msg.role === "assistant" && msg.sources && (
            <div className="message-sources">
                <strong>Sources:</strong>
                <ul>
                    {msg.sources.map((src, i) => (
                        <li key={i}>
                            {src.payload.title} (Score: {(src.score * 100).toFixed(0)}%)
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
))}
```

**Also update the state to store sources:**
```javascript
// In handleSend function, after receiving response
const data = await res.json();
const botMessage = { 
    role: "assistant", 
    content: data.answer,
    sources: data.sources  // Add this
};
```

**Add CSS in `ChatPage.scss`:**
```scss
.message-sources {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.85em;
    opacity: 0.8;
    
    ul {
        margin: 5px 0 0 20px;
        padding: 0;
    }
    
    li {
        margin: 3px 0;
    }
}
```

---

## 8. Change Typing Animation Speed

**Interview Question:** "Can you make the typing faster/slower?"

### **File:** `frontend/src/ChatPage.jsx`

**Find this line (around line 95):**
```javascript
setTimeout(typeNextChar, 5);  // 5ms per character
```

**Change to:**
```javascript
setTimeout(typeNextChar, 10);  // Slower (10ms per character)
// OR
setTimeout(typeNextChar, 2);   // Faster (2ms per character)
// OR
setTimeout(typeNextChar, 0);   // Instant (no animation)
```

**Why you might change this:**
- Faster = Feels more responsive
- Slower = More dramatic, easier to read
- Instant = Best for debugging

---

## 9. Add Multi-Turn Context

**Interview Question:** "Can the AI remember previous messages?"

### **File:** `backend/src/services/ragService.js`

**Modify `runRagQuery` to accept history:**
```javascript
export async function runRagQuery(query, conversationHistory = []) {
    const cached = await getCached(query);
    if (cached) return { ...cached, cached: true };

    const vector = await embedTextWithJina(query, "retrieval.query");
    const points = await searchQdrant(vector, 5);
    const context = buildContextFromPoints(points);
    
    // Build conversation context
    const conversationContext = conversationHistory
        .slice(-4)  // Last 4 messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join("\n");
    
    // Pass both article context AND conversation history to Gemini
    const answer = await generateAnswerWithGemini(
        query, 
        context, 
        conversationContext  // Add this
    );

    const sources = points.map((pt) => ({
        id: pt.id,
        score: pt.score,
        payload: pt.payload,
    }));

    const payload = { answer, sources, cached: false };
    await setCached(query, payload);
    return payload;
}
```

### **File:** `backend/src/utils/geminiClient.js`

**Modify the prompt:**
```javascript
export async function generateAnswerWithGemini(query, context, conversationContext = "") {
    if (!answerModel) {
        return "Sorry — the LLM model is not configured on this machine.";
    }

    const prompt = `
You are a news chatbot using Retrieval-Augmented Generation.

${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ""}

Use ONLY the context below to answer the user's question. 
If the answer is not clearly in the context, say you are not sure.

Context:
${context}

User question: ${query}

Answer in 3–6 concise sentences, neutral and factual.
`;

    // ... rest of the function
}
```

### **File:** `backend/src/services/chatService.js`

**Update processChat:**
```javascript
export async function processChat(sessionId, userMessage) {
    const history = (await getSessionHistory(sessionId)) || [];
    history.push({ role: "user", content: userMessage });

    // Pass history to RAG
    const { answer, sources, cached } = await runRagQuery(userMessage, history);

    history.push({ role: "assistant", content: answer });
    await saveSessionHistory(sessionId, history, SESSION_TTL);

    return { sessionId, answer, history, sources, cached };
}
```

---

## 10. Change Session ID Length

**Interview Question:** "What if you wanted longer session IDs?"

### **File:** `frontend/src/ChatPage.jsx`

**Find this line (around line 20):**
```javascript
stored = Math.floor(100000 + Math.random() * 900000).toString();  // 6 digits
```

**Change to:**
```javascript
// 8 digits (10000000 to 99999999)
stored = Math.floor(10000000 + Math.random() * 90000000).toString();

// OR use UUID for maximum uniqueness
import { v4 as uuidv4 } from 'uuid';
stored = uuidv4();  // e.g., "550e8400-e29b-41d4-a716-446655440000"
```

**Why you might change this:**
- Longer = More unique, less collision risk
- Shorter = Easier to read/share
- UUID = Maximum uniqueness, but ugly

---

## 🎯 Quick Reference: Where to Find Things

| What to Change | File | Line (approx) |
|----------------|------|---------------|
| Number of articles | `ragService.js` | 145 |
| Cache duration | `config/env.js` | 15 |
| AI model | `config/env.js` | 8 |
| Typing speed | `ChatPage.jsx` | 95 |
| Session ID format | `ChatPage.jsx` | 20 |
| Similarity metric | `ingest.js` | 42 |
| Prompt template | `geminiClient.js` | 95 |

---

## 💡 Interview Tips

When making changes:
1. **Explain WHY** before you change
2. **Mention tradeoffs** (speed vs accuracy, cost vs quality)
3. **Test after changing** (show it works)
4. **Discuss alternatives** (other ways to solve it)

**Example:**
> "To retrieve more articles, I'd change line 145 in ragService.js from 5 to 10. This gives more context but increases response time. The tradeoff is accuracy vs speed. For news, 5 is optimal, but for research, 10-15 might be better."

---

## 🚀 Quick Testing Commands

After making changes, test with:

```bash
# Restart backend
cd backend
npm start

# Restart frontend
cd frontend
npm run dev

# Test a query
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test123","userMessage":"What is the latest news?"}'
```

---

**You're ready to make any changes the interviewer asks for! 🎯**
