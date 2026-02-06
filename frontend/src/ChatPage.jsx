// frontend/src/ChatPage.jsx
import { useEffect, useState, useRef } from "react";
import "./ChatPage.scss";

// LOCAL BACKEND ONLY (Fallback)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://rag-chatbot-full.onrender.com";

export default function ChatPage() {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  // Create / load session (6-digit numeric) + fetch history
  useEffect(() => {
    let stored = localStorage.getItem("sessionId");
    if (!stored) {
      stored = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem("sessionId", stored);
    }
    setSessionId(stored);
    fetchHistory(stored);
  }, []);

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function fetchHistory(id) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/session/${id}/history`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.history || []);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  }

  // Send message + typing animation
  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    setError("");
    setLoading(true);

    const previous = messages;
    const userMsg = { role: "user", content: input };
    const optimistic = [...messages, userMsg];
    setMessages(optimistic);

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userMessage: input }),
      });

      if (!res.ok) {
        console.error("Chat error");
        setMessages(previous);
        setError("Something went wrong.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      const fullHistory = data.history || optimistic;
      const lastBot = fullHistory[fullHistory.length - 1];

      if (!lastBot || lastBot.role !== "assistant") {
        setMessages(fullHistory);
        setLoading(false);
        return;
      }

      // Typing effect
      const fullText = lastBot.content;
      const typedBot = { role: "assistant", content: "" };
      setMessages([...optimistic, typedBot]);

      let index = 0;
      function typeNextChar() {
        if (index < fullText.length) {
          typedBot.content += fullText[index];
          index++;
          setMessages([...optimistic, { ...typedBot }]);
          setTimeout(typeNextChar, 5);
        } else {
          setMessages(fullHistory);
        }
      }
      typeNextChar();

      setInput("");
    } catch (err) {
      console.error(err);
      setMessages(previous);
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  // Reset session → new ID + clear backend
  async function handleResetSession() {
    try {
      if (sessionId) {
        await fetch(`${BACKEND_URL}/api/session/${sessionId}/clear`, { method: "POST" });
      }
    } catch (err) {
      console.error("Failed to clear session", err);
    }

    const newId = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem("sessionId", newId);
    setSessionId(newId);
    setMessages([]);
    setError("");
  }

  return (
    <div className="app-root">
      <div className="chat-shell">
        <header className="chat-header">
          <div>
            <h1 className="chat-title">Voosh News Chatbot</h1>
            <p className="chat-subtitle">Ask anything about the ingested news articles.</p>
            <div className="chat-session-id">
              Session ID: <span>{sessionId}</span>
            </div>
          </div>
          <button className="reset-button" onClick={handleResetSession}>Reset session</button>
        </header>

        <main className="chat-main">
          {messages.length === 0 && !loading && (
            <div className="chat-empty-state">
              Try asking{" "}
              <span className="chat-empty-highlight">"Give me a summary of recent news"</span>.
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message-row ${msg.role === "user" ? "message-row--user" : "message-row--bot"}`}
            >
              <div className={`message-bubble ${msg.role === "user" ? "message-bubble--user" : "message-bubble--bot"}`}>
                <div className="message-label">{msg.role === "user" ? "You" : "Bot"}</div>
                <div className="message-content">{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && <div className="chat-loading">Bot is thinking…</div>}
          <div ref={messagesEndRef} />
        </main>

        {error && <div className="chat-error">{error}</div>}

        <form className="chat-input-bar" onSubmit={handleSend}>
          <input
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
          />
          <button type="submit" className="send-button" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
