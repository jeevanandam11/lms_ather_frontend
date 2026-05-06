import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../../App.css";
import WorkspacePanel from "../workspace/WorkspacePanel";
import Header from "../header/Header";

const AetherPlayer = ({ topic, historyId, isSidebarOpen, toggleSidebar }) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      setData({}); // Clear previous session data completely to avoid PDF caching visually
      const res = await axios.post("http://localhost:8080/api/ai/generate", {
        topic,
      });
      setData(res.data);
      // Initialize Gemini history style
      const initialHistory = [
        { role: "user", parts: [{ text: `Generate a lesson for: ${topic}` }] },
        {
          role: "model",
          parts: [
            { text: "Here is your generated lesson. (View notes above)" },
          ],
        },
      ];
      setChatHistory(initialHistory);

      // Save History
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        try {
          await axios.post("http://localhost:8080/api/history/save", {
            topicName: res.data.title || topic,
            pdfBase64: res.data.pdf || "",
            lessonData: JSON.stringify({ data: res.data, chatHistory: initialHistory }),
            userId: user.id,
          });
          window.dispatchEvent(new Event("historyUpdated"));
        } catch (saveErr) {
          console.error("Failed to save history:", saveErr);
        }
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryLesson = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/history/get/${id}`);
      if (res.data && res.data.lessonData) {
        const parsed = JSON.parse(res.data.lessonData);
        setData(parsed.data || {});
        setChatHistory(parsed.chatHistory || []);
      }
    } catch (err) {
      console.error("Error fetching history lesson:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (historyId) {
      fetchHistoryLesson(historyId);
    } else if (topic) {
      fetchLesson();
    }
  }, [topic, historyId]);

  const handleAsk = async (optionalQ = null) => {
    const qStr = (typeof optionalQ === "string" ? optionalQ : question).trim();
    if (!qStr) return;
    const newHistory = [
      ...chatHistory,
      { role: "user", parts: [{ text: qStr }] },
    ];
    setChatHistory(newHistory);
    setQuestion("");
    setChatLoading(true);

    try {
      const res = await axios.post("http://localhost:8080/api/ai/chat", {
        contents: newHistory,
      });

      const newHistoryWithModel = [
        ...newHistory,
        { role: "model", parts: [{ text: res.data.text }] },
      ];
      setChatHistory(newHistoryWithModel);

      // Update timeline to include the chat question and answer for PDF generation
      const newTimeline = [...(data.timeline || [])];
      newTimeline.push({ type: "quote", text: `<b>Question: ${qStr}</b>` });

      let rawContent = res.data.text;
      if (rawContent.includes("SUGGESTIONS:")) {
        rawContent = rawContent.split("SUGGESTIONS:")[0].trim();
      }

      const parts = rawContent.split(/(```[\s\S]*?```)/g);
      parts.forEach((part) => {
        if (!part.trim()) return;
        const isCode =
          part.trim().startsWith("```") && part.trim().endsWith("```");
        if (isCode) {
          const lines = part.trim().split("\n");
          const codeText = lines.slice(1, -1).join("\n");
          newTimeline.push({ type: "code", text: codeText });
        } else {
          let htmlText = part.trim().replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
          htmlText = htmlText.replace(/^(?:-|\*)\s+(.*)$/gm, "<li>$1</li>");
          htmlText = htmlText.replace(
            /(<li>.*<\/li>(?:\n<li>.*<\/li>)*)/g,
            "<ul>$1</ul>",
          );
          // add br for single newlines to preserve paragraph spacing if any
          htmlText = htmlText.replace(
            /\n(?!\s*<(?:ul|li|\/ul|\/li|b|\/b|strong|\/strong)>)/g,
            "<br/>\n",
          );
          newTimeline.push({ type: "summary", text: htmlText });
        }
      });

      const newData = { ...data, timeline: newTimeline };
      setData(newData);

      // Regenerate PDF with updated timeline
      try {
        const pdfRes = await axios.post(
          "http://localhost:8080/api/ai/updatePdf",
          {
            title: data.title,
            timeline: newTimeline,
          },
        );
        if (pdfRes.data.pdf) {
          setData((prev) => ({ ...prev, pdf: pdfRes.data.pdf }));
        }
      } catch (pdfErr) {
        console.error("PDF Regeneration Error:", pdfErr);
      }
    } catch (err) {
      console.error("Chat Error:", err);
      setChatHistory([
        ...newHistory,
        {
          role: "model",
          parts: [
            { text: "Sorry, an error occurred communicating with Aether AI." },
          ],
        },
      ]);
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
    <>
      <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className="container-fluid p-0 text-white d-flex flex-column mar-top-space-ather"
        style={{ height: "calc(100vh - 70px)" }}
      >
        {loading && (
          <div className="p-4">
            <h4 className="text-white">Generating AI Lesson...</h4>
          </div>
        )}

        {!loading && data.title && (
          <div
            ref={containerRef}
            className="d-flex flex-row flex-grow-1 overflow-hidden"
            style={{ minHeight: "85vh" }}
          >
            {/* 🧠 NOTES & CHAT - LEFT SIDE */}
            {!isFullscreen && (
              <div
                className="d-flex flex-column p-4"
                style={{
                  width: `${leftWidth}%`,
                  backgroundColor: "var(--bg-dark)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0">
                  <h4 className="fw-bold mb-0 text-accent">
                    {data.title || "AI Generated Lesson"}
                  </h4>
                  {data.pdf && (
                    <a
                      href={`data:application/pdf;base64,${data.pdf}`}
                      download={`${topic ? topic.replace(/\s+/g, "_") : "lesson"}.pdf`}
                      className="btn btn-sm btn-outline-purple"
                    >
                      <i className="bi bi-download me-2"></i>Export PDF
                    </a>
                  )}
                </div>

                <div
                  className="flex-grow-1 overflow-auto pe-2"
                  style={{ paddingBottom: "20px" }}
                >
                  {/* ORIGINAL GENERATED NOTES */}
                  <div className="notes-list mb-4">
                    <p className="description text-muted mb-3 fw-bold ps-1">
                      LESSON CONTENT
                    </p>
                    {data.timeline?.map((item, i) => (
                      <div
                        key={`tl-${i}`}
                        className="mb-4"
                        style={{
                          backgroundColor: "#1e2130",
                          borderRadius: "12px",
                          padding: "20px",
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <div
                          className="mb-3 text-uppercase"
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            color: "#f8f9fa",
                            letterSpacing: "1px",
                          }}
                        >
                          {item.type === "code" ? "CODE" : "SUMMARY"}
                        </div>
                        {item.type === "code" ? (
                          <div className="position-relative">
                            <button
                              onClick={(e) => {
                                navigator.clipboard.writeText(item.text);
                                const btn = e.currentTarget;
                                btn.innerHTML =
                                  '<i class="bi bi-check2"></i> Copied!';
                                setTimeout(
                                  () =>
                                    (btn.innerHTML =
                                      '<i class="bi bi-clipboard me-1"></i> Copy'),
                                  2000,
                                );
                              }}
                              className="btn btn-sm position-absolute top-0 end-0 m-2 border-0"
                              style={{
                                cursor: "pointer",
                                color: "#a5b4fc",
                                backgroundColor: "rgba(165,180,252,0.1)",
                              }}
                              title="Copy code"
                            >
                              <i className="bi bi-clipboard me-1"></i> Copy
                            </button>
                            <pre
                              className="p-4 bg-black rounded text-light overflow-auto"
                              style={{
                                fontSize: "0.9rem",
                                borderBottom: "10px solid #3b4261",
                                fontFamily: "monospace",
                                margin: 0,
                                whiteSpace: "pre",
                              }}
                            >
                              {item.text}
                            </pre>
                          </div>
                        ) : item.type === "quote" ? (
                          <blockquote
                            className="border-start border-4 border-accent ps-3 text-light fst-italic my-2"
                            dangerouslySetInnerHTML={{ __html: item.text }}
                          ></blockquote>
                        ) : (
                          <div
                            className="text-light opacity-75"
                            style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
                            dangerouslySetInnerHTML={{ __html: item.text }}
                          ></div>
                        )}
                      </div>
                    ))}
                    {data.suggestions && data.suggestions.length > 0 && (
                      <div className="mt-4 mb-4 d-flex flex-wrap gap-2">
                        {data.suggestions.map((sug, i) => (
                          <button
                            key={`init-sug-${i}`}
                            onClick={() => handleAsk(sug)}
                            className="btn btn-sm btn-outline-light rounded-pill border-opacity-25"
                            style={{
                              fontSize: "0.8rem",
                              color: "#a5b4fc",
                              borderColor: "rgba(165,180,252,0.5)",
                              backgroundColor: "rgba(165,180,252,0.05)",
                            }}
                          >
                            <i className="bi bi-box-arrow-up-right me-2"></i>{" "}
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CHAT HISTORY */}
                  <div className="chat-history mt-5 pt-4">
                    <h6 className="text-muted mb-4 opacity-75 fw-bold ps-1">
                      <i className="bi bi-chat-dots me-2"></i>FOLLOW-UP CHAT
                    </h6>
                    {chatHistory.slice(2).map((msg, i) => {
                      if (msg.role === "user") {
                        return (
                          <div
                            key={`chat-${i}`}
                            className="mb-4 ms-5 p-3 rounded"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.05)",
                            }}
                          >
                            <div className="small fw-bold mb-2 text-white">
                              You
                            </div>
                            <div
                              className="text-light"
                              style={{
                                fontSize: "0.95rem",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {msg.parts[0].text}
                            </div>
                          </div>
                        );
                      } else {
                        let rawContent = msg.parts[0].text;
                        let chatSuggestions = [];
                        const suggestionMatch = rawContent.match(
                          /SUGGESTIONS:\s*(\[.*?\])/s,
                        );
                        if (suggestionMatch) {
                          try {
                            const parsedArr = JSON.parse(suggestionMatch[1]);
                            if (Array.isArray(parsedArr))
                              chatSuggestions = parsedArr;
                            rawContent = rawContent
                              .replace(suggestionMatch[0], "")
                              .trim();
                          } catch (e) {}
                        }
                        if (rawContent.includes("SUGGESTIONS:")) {
                          rawContent = rawContent
                            .split("SUGGESTIONS:")[0]
                            .trim();
                        }

                        // Parse model output into code/summary blocks
                        const parts = rawContent.split(/(```[\s\S]*?```)/g);
                        return (
                          <div key={`chat-${i}`} className="mb-4 me-2">
                            {parts.map((part, pIdx) => {
                              if (!part.trim()) return null;
                              const isCode =
                                part.trim().startsWith("```") &&
                                part.trim().endsWith("```");

                              let rawText = part.trim();
                              if (isCode) {
                                const lines = rawText.split("\n");
                                rawText = lines.slice(1, -1).join("\n"); // remove ``` tags
                              } else {
                                // basic Markdown parsing since dangerouslySetInnerHTML is used
                                rawText = rawText.replace(
                                  /\*\*(.*?)\*\*/g,
                                  "<strong>$1</strong>",
                                );
                                rawText = rawText.replace(
                                  /^(?:-|\*)\s+(.*)$/gm,
                                  "<li>$1</li>",
                                );
                                rawText = rawText.replace(
                                  /(<li>.*<\/li>(?:\n<li>.*<\/li>)*)/g,
                                  '<ul class="mb-3">$1</ul>',
                                );
                                rawText = rawText.replace(
                                  /\n(?!\s*<(?:ul|li|\/ul|\/li|b|\/b|strong|\/strong)>)/g,
                                  "<br/>\n",
                                );
                              }

                              return (
                                <div
                                  key={`block-${pIdx}`}
                                  className="mb-3"
                                  style={{
                                    backgroundColor: "#1e2130",
                                    borderRadius: "12px",
                                    padding: "20px",
                                    border: "1px solid rgba(255,255,255,0.05)",
                                  }}
                                >
                                  <div
                                    className="mb-3 text-uppercase"
                                    style={{
                                      fontSize: "0.75rem",
                                      fontWeight: "800",
                                      color: "#f8f9fa",
                                      letterSpacing: "1px",
                                    }}
                                  >
                                    {isCode ? "CODE" : "SUMMARY"}
                                  </div>
                                  {isCode ? (
                                    <div className="position-relative">
                                      <button
                                        onClick={(e) => {
                                          navigator.clipboard.writeText(
                                            rawText,
                                          );
                                          const btn = e.currentTarget;
                                          btn.innerHTML =
                                            '<i class="bi bi-check2"></i> Copied!';
                                          setTimeout(
                                            () =>
                                              (btn.innerHTML =
                                                '<i class="bi bi-clipboard me-1"></i> Copy'),
                                            2000,
                                          );
                                        }}
                                        className="btn btn-sm position-absolute top-0 end-0 m-2 border-0"
                                        style={{
                                          cursor: "pointer",
                                          color: "#a5b4fc",
                                          backgroundColor:
                                            "rgba(165,180,252,0.1)",
                                        }}
                                        title="Copy code"
                                      >
                                        <i className="bi bi-clipboard me-1"></i>{" "}
                                        Copy
                                      </button>
                                      <pre
                                        className="p-4 bg-black rounded text-light overflow-auto"
                                        style={{
                                          fontSize: "0.9rem",
                                          borderBottom: "10px solid #3b4261",
                                          fontFamily: "monospace",
                                          margin: 0,
                                          whiteSpace: "pre",
                                        }}
                                      >
                                        {rawText}
                                      </pre>
                                    </div>
                                  ) : (
                                    <div
                                      className="text-light opacity-75"
                                      style={{
                                        fontSize: "0.95rem",
                                        lineHeight: "1.6",
                                      }}
                                      dangerouslySetInnerHTML={{
                                        __html: rawText,
                                      }}
                                    ></div>
                                  )}
                                </div>
                              );
                            })}
                            {chatSuggestions.length > 0 && (
                              <div className="mt-3 d-flex flex-wrap gap-2">
                                {chatSuggestions.map((sug, sIdx) => (
                                  <button
                                    key={`chatsug-${i}-${sIdx}`}
                                    onClick={() => handleAsk(sug)}
                                    className="btn btn-sm btn-outline-light rounded-pill border-opacity-25"
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#a5b4fc",
                                      borderColor: "rgba(165,180,252,0.5)",
                                      backgroundColor: "rgba(165,180,252,0.05)",
                                    }}
                                  >
                                    <i className="bi bi-box-arrow-up-right me-1"></i>{" "}
                                    {sug}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                    })}
                    {chatLoading && (
                      <div className="mb-3 p-3 rounded bg-accent bg-opacity-10 me-5 text-light fst-italic opacity-75">
                        <small>Aether is generating...</small>
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
                    <button
                      className="btn btn-accent px-4 fw-bold"
                      onClick={handleAsk}
                      disabled={chatLoading}
                      style={{ borderRadius: "0 10px 10px 0" }}
                    >
                      <i className="bi bi-send-fill me-2"></i>Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isFullscreen && (
              /* ↕️ RESIZER DRAG HANDLE */
              <div
                className="resizer d-flex align-items-center justify-content-center"
                onMouseDown={startResizing}
                style={{
                  width: "8px",
                  cursor: "col-resize",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  zIndex: 10,
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.15)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.05)")
                }
              >
                <div
                  style={{
                    height: "40px",
                    width: "4px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: "2px",
                  }}
                ></div>
              </div>
            )}

            {/* 💻 WORKSPACE - RIGHT SIDE */}
            <div
              className="h-100 bg-black"
              style={{
                width: isFullscreen
                  ? "100%"
                  : `calc(${100 - leftWidth}% - 8px)`,
              }}
            >
              <WorkspacePanel
                isFullscreen={isFullscreen}
                setIsFullscreen={setIsFullscreen}
                topic={topic}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AetherPlayer;
