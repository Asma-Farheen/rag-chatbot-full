# 📋 Chat History - Quick Reference

## How Chat History Works

### Storage Structure
```
Redis Key: session:{sessionId}:messages
Value: JSON array of messages
TTL: 3600 seconds (1 hour)
```

### Message Format
```json
{
  "role": "user" | "assistant",
  "content": "message text"
}
```

---

## 🔍 Methods to Check History

### 1. **In the UI** (Easiest)
- Just look at the chat window
- All messages are displayed
- Session ID shown at top

### 2. **Browser Console** (Quick)
```javascript
// Get session ID
localStorage.getItem('sessionId')

// Fetch history
fetch(`http://localhost:3000/api/session/${sessionId}/history`)
  .then(r => r.json())
  .then(d => console.table(d.history))
```

### 3. **API Request** (External)
```bash
# Using curl
curl http://localhost:3000/api/session/123456/history

# Using PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/session/123456/history"
```

### 4. **Helper Scripts** (Convenient)
```bash
# Check specific session
cd backend
node checkHistory.js 123456

# List all active sessions
node listSessions.js
```

### 5. **Redis CLI** (Direct)
```bash
# Connect to Redis
docker exec -it redis_cache redis-cli

# List all sessions
KEYS session:*

# Get specific session
GET session:123456:messages

# Check expiry time
TTL session:123456:messages
```

### 6. **Network Tab** (Debugging)
1. Open DevTools (F12)
2. Network tab
3. Send a message
4. Click `/api/chat` request
5. View Response → `history` field

---

## 📊 API Endpoints

### Get History
```
GET /api/session/:sessionId/history

Response:
{
  "sessionId": "123456",
  "history": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

### Clear History
```
POST /api/session/:sessionId/clear

Response:
{
  "message": "Session cleared",
  "sessionId": "123456"
}
```

---

## 🛠️ Troubleshooting

### No History Found?
1. Check if session ID is correct
2. History expires after 1 hour
3. Check if Redis is running: `docker ps`
4. Check backend logs for errors

### Session ID Unknown?
```javascript
// In browser console
localStorage.getItem('sessionId')
```

### Redis Not Responding?
```bash
# Check if Redis container is running
docker ps | grep redis

# Restart Redis
docker-compose restart redis
```

---

## 💡 Quick Commands

```bash
# Find your session ID (browser console)
localStorage.getItem('sessionId')

# Get history via API
curl http://localhost:3000/api/session/$(localStorage.getItem('sessionId'))/history

# List all sessions
cd backend && node listSessions.js

# Check specific session
cd backend && node checkHistory.js 123456

# Clear session
curl -X POST http://localhost:3000/api/session/123456/clear
```

---

## 📝 Example Output

### checkHistory.js
```
✅ Session 507003 - 4 messages:

1. [USER]
   What's the latest tech news?

2. [ASSISTANT]
   Based on recent articles, the main tech news includes...

3. [USER]
   Tell me more about AI

4. [ASSISTANT]
   AI developments include...

⏱️  Expires in: 47 minutes
```

### listSessions.js
```
✅ Found 2 active session(s):

📝 Session ID: 507003
   Messages: 4
   Expires in: 47 minutes
   Last message: "AI developments include..."

📝 Session ID: 123456
   Messages: 2
   Expires in: 12 minutes
   Last message: "Hello! How can I help you today?..."
```

---

## 🎯 For Interviews

**Q: How is chat history stored?**
- Redis (in-memory database)
- Key format: `session:{sessionId}:messages`
- TTL: 1 hour
- Format: JSON array of message objects

**Q: How to retrieve history?**
- API endpoint: `GET /api/session/:id/history`
- Automatically loaded on page refresh
- Stored in React state for UI display

**Q: Why Redis?**
- Fast (in-memory)
- TTL support (auto-expiry)
- Simple key-value storage
- Perfect for temporary session data
