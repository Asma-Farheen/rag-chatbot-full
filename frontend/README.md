# Voosh News Chatbot — Frontend (React + SCSS)

This is the frontend for the RAG-powered News Chatbot built for the Voosh assignment.

It provides a clean, responsive chat UI that communicates with the backend using REST APIs.

---

## 🚀 Tech Stack
* **React + Vite**
* **SCSS** (custom UI styling)
* **Fetch API**
* **LocalStorage** (for `sessionId`)

---

## 📁 Project Structure

frontend/ ├── src/ 
                 │ ├── ChatPage.jsx # Chat UI logic (State, Handlers, API calls) 
                 │ ├── ChatPage.scss # UI styling (Modern Emerald/Dark Teal Theme) 
                 │ ├── App.jsx 
                 │ └── main.jsx 
                 ├── public/ 
                 ├── package.json 
                 └── README.md

---

## ⚙️ Setup Instructions

1️⃣ **Install dependencies**
```bash
npm install

2️⃣ Start frontend
Bash
npm run dev

Frontend runs at: http://localhost:5173

Note: Ensure the backend is running at http://localhost:3001 for the chat API calls to work.

💬 Features
✅ Chat UI & Responsiveness
Fully Centered and Responsive layout (perfect on desktop and mobile).

Elegant Dark Teal / Emerald theme.

User & Bot message bubbles with distinct styling.

Auto-scroll to the latest message.

Fixed header and input bar.

✅ Typing / Streaming Effect
Bot responses appear letter by letter for a natural, engaging feel, implemented via a short setTimeout loop.

✅ Sessions & History
A unique 6-digit numeric session ID is generated on the first load and stored in LocalStorage.

This ID is sent with every query to the backend to manage conversation history in Redis.

The Reset Session button:

Clears the chat history in the backend (Redis).

Generates a new, unique sessionId.

Resets the local UI state.

✅ API Integration
The frontend relies on the following backend routes:

POST /api/chat

GET /api/session/:id/history

POST /api/session/:id/clear

🧠 How Frontend Works
Session Logic: The component checks localStorage for an existing sessionId. If none is found, a new one is generated and saved. This ID is passed to all API calls.

Chat Logic: The user message is optimistically added to the UI first. Upon receiving the full updated history from the backend, the last bot message is extracted and displayed using the custom typing animation logic (typeNextChar function).