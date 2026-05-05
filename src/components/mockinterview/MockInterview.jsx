import React, { useState, useEffect, useRef } from "react";
import "./MockInterview.css";
import axios from "axios";
import Header from "../header/Header";

const MockInterview = ({ isSidebarOpen, toggleSidebar }) => {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [historySidebarOpen, setHistorySidebarOpen] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const currentSessionIdRef = useRef(null);

  const updateSessionId = (id) => {
    setCurrentSessionId(id);
    currentSessionIdRef.current = id;
  };

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const isAutoModeRef = useRef(false);
  const isLoadingRef = useRef(false);
  const messagesRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const accumulatedTranscriptRef = useRef("");
  const isSpeakingRef = useRef(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roadmapData = JSON.parse(
    localStorage.getItem("placementRoadmap") || "{}",
  );

  useEffect(() => {
    messagesRef.current = messages;
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchSessionHistory();
    initSpeechRecognition();

    // Initial system prompt if no messages
    if (messages.length === 0) {
      startNewSession();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const setLoading = (val) => {
    setIsLoading(val);
    isLoadingRef.current = val;
  };

  const setAutoMode = (val) => {
    setIsAutoMode(val);
    isAutoModeRef.current = val;
  };

  const initSpeechRecognition = () => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        if (isSpeakingRef.current) return;

        let currentInterim = "";
        let finalSegment = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalSegment += event.results[i][0].transcript + " ";
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalSegment) {
          accumulatedTranscriptRef.current += finalSegment;
        }

        const fullText = (
          accumulatedTranscriptRef.current + currentInterim
        ).trim();
        if (fullText) {
          setInputVal(fullText);
        }

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        if (fullText.length > 0 && isAutoModeRef.current) {
          // Wait 3 seconds of silence before auto-sending
          silenceTimerRef.current = setTimeout(() => {
            handleSendMessage(null, fullText);
          }, 3000);
        }
      };

      recognitionRef.current.onend = () => {
        if (isAutoModeRef.current && !isLoadingRef.current) {
          setTimeout(() => {
            if (isAutoModeRef.current && !isLoadingRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {}
            }
          }, 300);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== "no-speech") {
          setAutoMode(false);
        }
      };
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }
  };

  const toggleRecording = () => {
    if (isAutoMode) {
      setAutoMode(false);
      recognitionRef.current?.stop();
      window.speechSynthesis.cancel();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    } else {
      setAutoMode(true);
      setInputVal("");
      accumulatedTranscriptRef.current = "";
      try {
        recognitionRef.current?.start();
      } catch (e) {
        // ignore already started error
      }
    }
  };

  const fetchSessionHistory = async () => {
    if (!user.id) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/api/interview/session/user/${user.id}`,
      );
      setSessionHistory(res.data);
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  };

  const saveCurrentSession = async (currentMessages) => {
    if (!user.id) return;
    const targetRole = roadmapData.targetRole || "Mock Interview";
    const payload = {
      id: currentSessionIdRef.current,
      userId: user.id,
      targetRole: targetRole,
      conversationHistory: JSON.stringify(currentMessages),
    };

    try {
      const res = await axios.post(
        "http://localhost:8080/api/interview/session/save",
        payload,
      );
      if (res.data && res.data.id && !currentSessionIdRef.current) {
        updateSessionId(res.data.id);
        fetchSessionHistory(); // Refresh history
      }
    } catch (e) {
      console.error("Failed to save session", e);
    }
  };

  const handleSendMessage = async (e, textOverride = null) => {
    e?.preventDefault();
    const textToSend = textOverride !== null ? textOverride : inputVal;
    if (!textToSend.trim()) return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    accumulatedTranscriptRef.current = "";

    const newMessages = [
      ...messagesRef.current,
      { role: "user", content: textToSend },
    ];
    setMessages(newMessages);
    setInputVal("");
    setLoading(true);

    // Ensure mic is stopped while loading
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }

    try {
      const res = await axios.post("http://localhost:8080/api/interview/chat", {
        messages: newMessages,
      });

      const reply = res.data.reply;
      const finalMessages = [
        ...newMessages,
        { role: "assistant", content: reply },
      ];
      setMessages(finalMessages);
      saveCurrentSession(finalMessages);

      speakText(reply);
    } catch (err) {
      console.error("Error calling chat API", err);
      const backendError =
        err.response?.data?.error ||
        "Sorry, I am having trouble connecting to the AI.";
      const errMessages = [
        ...newMessages,
        { role: "assistant", content: backendError },
      ];
      setMessages(errMessages);
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1.0;

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        try {
          recognitionRef.current?.abort();
        } catch (e) {}
      };

      // Since we wait for AI to finish before listening, start mic here
      utterance.onend = () => {
        isSpeakingRef.current = false;
        setLoading(false);
        if (isAutoModeRef.current) {
          setInputVal("");
          accumulatedTranscriptRef.current = "";
          setTimeout(() => {
            if (!isSpeakingRef.current) {
              try {
                recognitionRef.current?.start();
              } catch (e) {}
            }
          }, 300);
        }
      };

      utterance.onerror = () => {
        isSpeakingRef.current = false;
        setLoading(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setLoading(false);
    }
  };

  const loadSession = (session) => {
    try {
      const hist = JSON.parse(session.conversationHistory);
      setMessages(hist);
      updateSessionId(session.id);
      setHistorySidebarOpen(false);
      setAutoMode(false);
      window.speechSynthesis.cancel();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      accumulatedTranscriptRef.current = "";
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
    } catch (e) {
      console.error("Error loading session history", e);
    }
  };

  const startNewSession = () => {
    const sysMsg = {
      role: "system",
      content: `You are an AI mock interviewer acting like a real-time HR/Technical interviewer.
Rules:
- CRITICAL: Your responses MUST be extremely short (maximum 1 or 2 sentences).
- Do not overwhelm the beginner. Keep it very brief and simple.
- Ask one question at a time.
- Wait for user response.
- Analyze the answer briefly in one short sentence.
- Ask the next relevant question.
- Keep questions professional and realistic.
- Adjust difficulty based on user performance.
- NEVER ask the user to write code, build a program, or perform a hands-on task. ONLY ask conversational interview questions that can be answered verbally.

Start with a very short introduction question.`,
    };

    setMessages([sysMsg]);
    updateSessionId(null);
    setHistorySidebarOpen(false);
    setAutoMode(false);
    window.speechSynthesis.cancel();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    accumulatedTranscriptRef.current = "";
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getSessionHeading = (session) => {
    try {
      const hist = JSON.parse(session.conversationHistory);
      // Try to find the first user message or first substantive assistant message
      const firstUserMsg = hist.find(
        (m) =>
          m.role === "user" &&
          m.content !== "Hello, I am ready to begin the interview.",
      );
      if (firstUserMsg) {
        return firstUserMsg.content.length > 35
          ? firstUserMsg.content.substring(0, 35) + "..."
          : firstUserMsg.content;
      }
    } catch (e) {}
    return session.targetRole + " Interview";
  };

  return (
    <>
      <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className="mock-interview-container position-relative"
        style={{ paddingTop: "90px", height: "100vh" }}
      >
        {/* Local Header */}
        <div className="d-flex justify-content-between align-items-center mb-3 mt-3">
          <div>
            <h4 className="fw-bold mb-0">AI Mock Interview</h4>
            <small className="text-muted">
              Role: {roadmapData.targetRole || "Mock Interview"}
            </small>
          </div>
          <button
            className="btn btn-outline-light d-flex align-items-center gap-2 btn-outline-purple"
            onClick={() => setHistorySidebarOpen(true)}
          >
            <i className="bi bi-clock-history "></i> History
          </button>
        </div>

        {/* History Sidebar */}
        <div
          className={`chat-history-sidebar ${historySidebarOpen ? "open" : ""}`}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0 fw-bold">Past Sessions</h5>
            <button
              className="btn btn-link text-light p-0"
              onClick={() => setHistorySidebarOpen(false)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <button
            className="btn btn-accent w-100 mb-4 py-2 fw-bold shadow-none"
            onClick={startNewSession}
          >
            <i className="bi bi-plus-lg me-2"></i> New Session
          </button>

          <div className="d-flex flex-column gap-2">
            {sessionHistory.length === 0 ? (
              <p className="text-muted small text-center mt-3">
                No past sessions found.
              </p>
            ) : (
              sessionHistory.map((session) => (
                <div
                  key={session.id}
                  className="bg-dark p-3 rounded border border-secondary border-opacity-25 hover-glow cursor-pointer"
                  onClick={() => loadSession(session)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="fw-bold text-truncate">
                    {getSessionHeading(session)}
                  </div>
                  <small className="text-muted d-block mt-1">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-window flex-grow-1 bg-dark bg-opacity-25 rounded border border-secondary border-opacity-25 position-relative">
          {messages.filter((m) => m.role !== "system").length === 0 &&
            !isLoading && (
              <div className="text-center text-muted my-auto opacity-50">
                <i className="bi bi-mic text-accent fs-1 mb-3 d-block"></i>
                <h5>Start your mock interview!</h5>
                <p>Click the microphone or type to begin.</p>
              </div>
            )}

          {messages
            .filter((m) => m.role !== "system")
            .map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                {msg.content}
              </div>
            ))}

          {isLoading && (
            <div className="message assistant">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form className="input-area" onSubmit={handleSendMessage}>
          <button
            type="button"
            className={`mic-btn ${isAutoMode ? "recording" : ""}`}
            onClick={toggleRecording}
            title={
              isAutoMode ? "Stop Auto-Voice Mode" : "Start Auto-Voice Mode"
            }
          >
            <i className={`bi ${isAutoMode ? "bi-mic-fill" : "bi-mic"}`}></i>
          </button>

          <input
            type="text"
            placeholder={isAutoMode ? "Listening..." : "Type your response..."}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isAutoMode || isLoading}
          />

          <button
            type="submit"
            className="send-btn"
            disabled={!inputVal.trim() || isLoading}
          >
            <i className="bi bi-send-fill"></i>
          </button>
        </form>
      </div>
    </>
  );
};

export default MockInterview;
