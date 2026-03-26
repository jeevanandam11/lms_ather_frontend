import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../../App.css";

const AetherPlayer = ({ topic }) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Resizer state
  const [leftWidth, setLeftWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
    const handleMouseMove = (ev) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = ((ev.clientX - rect.left) / rect.width) * 100;
      if (newWidth >= 20 && newWidth <= 80) setLeftWidth(newWidth);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8080/api/ai/generate", { topic });
      setData(res.data);
      // Initialize Gemini history style
      setChatHistory([
        { role: "user", parts: [{ text: `Generate a lesson for: ${topic}` }] },
        { role: "model", parts: [{ text: "Here is your generated lesson. (View notes above)" }] }
      ]);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (topic) fetchLesson(); }, [topic]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    const newHistory = [...chatHistory, { role: "user", parts: [{ text: question }] }];
    setChatHistory(newHistory);
    setQuestion("");
    setChatLoading(true);

    try {
      const res = await axios.post("http://localhost:8080/api/ai/chat", { contents: newHistory });
      setChatHistory([...newHistory, { role: "model", parts: [{ text: res.data.text }] }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setChatHistory([...newHistory, { role: "model", parts: [{ text: "Sorry, an error occurred communicating with Aether AI." }] }]);
    } finally {
      setChatLoading(false);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="container-fluid h-100 p-0 text-white d-flex flex-column">
      {loading && <div className="p-4"><h4 className="text-white">Generating AI Lesson...</h4></div>}

      {!loading && data.title && (
        <div ref={containerRef} className="d-flex flex-row flex-grow-1 overflow-hidden" style={{ minHeight: "85vh" }}>
          
          {/* 🧠 NOTES & CHAT - LEFT SIDE */}
          <div className="d-flex flex-column p-4" style={{ width: `${leftWidth}%`, backgroundColor: "var(--bg-dark)" }}>
            
            <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0">
              <h4 className="fw-bold mb-0 text-accent">{data.title || "AI Generated Lesson"}</h4>
              {data.pdf && (
                <a href={`data:application/pdf;base64,${data.pdf}`} download="lesson.pdf" className="btn btn-sm btn-outline-light">
                  <i className="bi bi-download me-2"></i>Export PDF
                </a>
              )}
            </div>

            <div className="flex-grow-1 overflow-auto pe-2" style={{ paddingBottom: "20px" }}>
              {/* ORIGINAL GENERATED NOTES */}
              <div className="notes-list mb-4">
                <p className="description text-muted mb-3">Initial Lesson Notes:</p>
                {data.timeline?.map((item, i) => (
                  <div key={i} className="glass-card mb-3 p-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="badge bg-secondary bg-opacity-25 text-light">{formatTime(item.time)}</span>
                      <span className="badge bg-accent bg-opacity-10 text-accent text-uppercase" style={{ fontSize: "0.7rem"}}>{item.type}</span>
                    </div>
                    {item.type === "code" ? (
                      <pre className="p-3 bg-black rounded border border-secondary border-opacity-25 text-light overflow-auto" style={{ fontSize: "0.85rem" }}>{item.text}</pre>
                    ) : item.type === "quote" ? (
                      <blockquote className="border-start border-4 border-accent ps-3 text-light fst-italic my-2">{item.text}</blockquote>
                    ) : (
                      <p className="mb-0 text-light opacity-75">{item.text}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* CHAT HISTORY */}
              <div className="chat-history mt-5 border-top border-secondary border-opacity-25 pt-4">
                 <h6 className="text-muted mb-4 opacity-75"><i className="bi bi-chat-dots me-2"></i>Follow-Up Chat</h6>
                {chatHistory.slice(2).map((msg, i) => (
                  <div key={i} className={`mb-3 p-3 rounded ${msg.role === "user" ? "bg-secondary bg-opacity-25 ms-5" : "bg-accent bg-opacity-10 me-5"}`}>
                    <div className="small fw-bold mb-2" style={{ color: msg.role === "user" ? "#fff" : "var(--accent-purple)" }}>
                      {msg.role === "user" ? "You" : "Aether AI"}
                    </div>
                    <div className="text-light" style={{ fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>
                      {msg.parts[0].text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="mb-3 p-3 rounded bg-accent bg-opacity-10 me-5 text-light italic opacity-75">
                    <small>Aether is typing...</small>
                  </div>
                )}
              </div>
            </div>

            {/* CHAT INPUT AREA */}
            <div className="mt-4 flex-shrink-0 pt-2 border-top border-secondary border-opacity-25">
              <div className="input-group shadow">
                <input
                  type="text"
                  className="form-control bg-dark text-light border-0 shadow-none py-3 px-4"
                  placeholder="Ask further questions, clarify code, or request more examples..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                  style={{ borderRadius: "10px 0 0 10px" }}
                />
                <button className="btn btn-accent px-4 fw-bold" onClick={handleAsk} disabled={chatLoading} style={{ borderRadius: "0 10px 10px 0" }}>
                  <i className="bi bi-send-fill me-2"></i>Send
                </button>
              </div>
            </div>

          </div>

          {/* ↕️ RESIZER DRAG HANDLE */}
          <div
            className="resizer d-flex align-items-center justify-content-center"
            onMouseDown={startResizing}
            style={{
              width: "8px",
              cursor: "col-resize",
              backgroundColor: "rgba(255,255,255,0.05)",
              zIndex: 10,
              transition: "background 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
          >
             <div style={{ height: "40px", width: "4px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "2px" }}></div>
          </div>

          {/* 💻 COMPILER - RIGHT SIDE */}
          <div className="h-100 bg-black" style={{ width: `calc(${100 - leftWidth}% - 8px)` }}>
             <iframe 
                src="https://onecompiler.com/embed/" 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                style={{ border: "none", minHeight: "85vh", pointerEvents: isResizing ? "none" : "auto" }}
                title="Code Compiler"
             ></iframe>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default AetherPlayer;
