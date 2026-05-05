import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { findAlgorithm, dsaRegistry } from "./dsaRegistry";

const DSAVisualizer = ({ topic }) => {
  const [activeStruct, setActiveStruct] = useState("array");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.5);
  const [isVoiceOn, setIsVoiceOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  
  const [history, setHistory] = useState([]);
  const [step, setStep] = useState(0);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [timeComplexity, setTimeComplexity] = useState("");
  const [currentLabel, setCurrentLabel] = useState("");

  const [stateData, setStateData] = useState([]);
  const [activeIndices, setActiveIndices] = useState([]);
  const [codeLine, setCodeLine] = useState(0);
  const [description, setDescription] = useState("");
  
  const [explanationCache, setExplanationCache] = useState({});
  const isPlayingRef = useRef(false);
  const stepRef = useRef(0);
  const audioRef = useRef(null);
  
  // Keep refs synced for async loop access
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { stepRef.current = step; }, [step]);

  // Default array to operate on
  const defaultArray = [45, 12, 78, 34, 89, 23, 56, 90, 11, 67];

  const loadAlgorithm = (query) => {
    const { key, generator } = findAlgorithm(query || "bubble sort");
    const result = generator(defaultArray);
    setHistory(result.steps);
    setCodeSnippet(result.codeSnippet);
    setTimeComplexity(result.timeComplexity);
    setCurrentLabel(result.label);
    setActiveStruct(result.structType);
    setStep(0);
    setIsPlaying(false);
    if (audioRef.current) {
        audioRef.current.pause();
    }
  };

  useEffect(() => {
    loadAlgorithm(topic || "bubble sort");
  }, [topic]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      loadAlgorithm(searchQuery);
      setFilteredOptions([]);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredOptions([]);
    } else {
      const matches = Object.keys(dsaRegistry).filter(k => k.includes(query.toLowerCase()));
      setFilteredOptions(matches);
    }
  };

  const selectAlgorithm = (key) => {
    setSearchQuery(key);
    setFilteredOptions([]);
    setShowSearch(false);
    loadAlgorithm(key);
  };

  // Asynchronous Step Engine
  useEffect(() => {
    let active = true;

    const processStep = async () => {
      if (!isPlayingRef.current || stepRef.current >= history.length) return;

      const currentStepObj = history[stepRef.current];
      const stepKey = `${currentLabel}-${stepRef.current}`;
      
      setStateData(currentStepObj.state);
      setActiveIndices(currentStepObj.active);
      setCodeLine(currentStepObj.line);

      let explText = explanationCache[stepKey];

      // 1. Fetch Groq Explanation
      if (!explText) {
        try {
          const res = await axios.post("http://localhost:8080/api/ai/chat", {
            contents: [{ role: "user", parts: [{ text: `Explain this algorithmic step briefly in one plain text sentence. Do NOT use any markdown formatting, asterisks, or HTML tags: ${currentStepObj.description}` }] }]
          });
          explText = res.data.text || res.data.explanation || currentStepObj.description;
          
          // Strip out the backend-injected SUGGESTIONS array if present
          if (explText.includes("SUGGESTIONS:")) {
            explText = explText.substring(0, explText.lastIndexOf("SUGGESTIONS:")).trim();
          }
          
          // Clean remaining HTML tags and Markdown asterisks
          explText = explText.replace(/<\/?[^>]+(>|$)/g, "");
          explText = explText.replace(/\*\*/g, "").replace(/\*/g, "").trim();

          setExplanationCache(prev => ({ ...prev, [stepKey]: explText }));
        } catch (e) {
          explText = currentStepObj.description; // fallback
        }
      }
      
      if (!active) return;
      setDescription(explText);

      // 2. Fetch and Play Inworld Voice
      if (isVoiceOn) {
        try {
          const audioRes = await axios.post("http://localhost:8080/api/interview/speak", {
            text: explText
          }, { responseType: 'blob' });
          
          if (!active || !isPlayingRef.current) return;
          
          const audioUrl = URL.createObjectURL(audioRes.data);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          
          await new Promise((resolve) => {
             audio.onended = resolve;
             audio.onerror = resolve;
             audio.play().catch(resolve);
          });
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        } catch (e) {
          console.error("Voice API failed, falling back to browser TTS.", e);
          if ("speechSynthesis" in window) {
            await new Promise((resolve) => {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(explText);
              utterance.lang = "en-US";
              utterance.rate = speed;
              utterance.onend = resolve;
              utterance.onerror = resolve;
              window.speechSynthesis.speak(utterance);
            });
          } else {
            await new Promise(r => setTimeout(r, 2000 / speed));
          }
        }
      } else {
        await new Promise(r => setTimeout(r, 2000 / speed));
      }

      if (active && isPlayingRef.current) {
         if (stepRef.current < history.length - 1) {
            setStep(s => s + 1);
         } else {
            setIsPlaying(false);
         }
      }
    };

    if (isPlaying) {
      processStep();
    }

    return () => { 
      active = false; 
      if (audioRef.current) {
          audioRef.current.pause();
      }
      if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying, step, isVoiceOn, speed, history, currentLabel]);

  // Handle manual step change to reflect UI immediately
  useEffect(() => {
     if (!isPlaying && history[step]) {
        const currentStepObj = history[step];
        setStateData(currentStepObj.state);
        setActiveIndices(currentStepObj.active);
        setCodeLine(currentStepObj.line);
        setDescription(explanationCache[`${currentLabel}-${step}`] || currentStepObj.description);
     }
  }, [step, isPlaying, history, currentLabel, explanationCache]);


  const reset = () => {
    setIsPlaying(false);
    setStep(0);
    if (audioRef.current) {
        audioRef.current.pause();
    }
  };

  const structs = [
    { id: "array", label: "Arrays/Sorting" },
    { id: "linkedlist", label: "Linked Lists" },
    { id: "stack", label: "Stack" },
    { id: "queue", label: "Queue" },
    { id: "tree", label: "Trees" },
    { id: "graph", label: "Graphs" }
  ];

  const renderVisualization = () => {
    if (activeStruct === "array") {
      if (!Array.isArray(stateData)) return null;
      return (
        <div className="d-flex align-items-end justify-content-center gap-2 h-100 w-100 px-4 pb-4 pt-5">
          {stateData.map((val, idx) => (
            <div key={idx} className="d-flex flex-column align-items-center" style={{ width: "8%" }}>
              <span className="small fw-bold text-white mb-2">{val}</span>
              <div 
                className="w-100 rounded-top transition-all"
                style={{ 
                  height: `${val}%`, 
                  backgroundColor: activeIndices.includes(idx) ? "var(--accent-color, #f59e0b)" : "#4f46e5",
                  boxShadow: activeIndices.includes(idx) ? "0 0 15px var(--accent-color, #f59e0b)" : "none",
                  transition: "all 0.2s ease-in-out"
                }}
              ></div>
              <span className="small text-muted mt-2">[{idx}]</span>
            </div>
          ))}
        </div>
      );
    } else if (activeStruct === "stack") {
      if (!Array.isArray(stateData)) return null;
      return (
        <div className="d-flex flex-column align-items-center justify-content-end h-100 w-100 pb-5 pt-5">
          <div className="border-start border-end border-bottom border-secondary border-3 rounded-bottom d-flex flex-column-reverse align-items-center p-2" style={{ width: "150px", minHeight: "200px" }}>
            {stateData.map((val, idx) => (
              <div 
                key={idx} 
                className="w-100 py-3 my-1 text-center rounded fw-bold transition-all"
                style={{
                  backgroundColor: activeIndices.includes(idx) ? "var(--accent-color, #f59e0b)" : "#4f46e5",
                  color: "#fff",
                  boxShadow: activeIndices.includes(idx) ? "0 0 15px var(--accent-color, #f59e0b)" : "none"
                }}
              >
                {val}
              </div>
            ))}
          </div>
          <span className="text-muted mt-2 fw-bold">STACK TOP</span>
        </div>
      );
    } else if (activeStruct === "queue") {
      if (!Array.isArray(stateData)) return null;
      return (
        <div className="d-flex align-items-center justify-content-center h-100 w-100 px-4 pb-4 pt-5">
          <span className="text-muted me-3 fw-bold">FRONT</span>
          <div className="border-top border-bottom border-secondary border-3 d-flex align-items-center p-2 overflow-hidden gap-2" style={{ minWidth: "300px", height: "80px" }}>
            {stateData.map((val, idx) => (
              <div 
                key={idx} 
                className="px-4 py-2 rounded fw-bold transition-all"
                style={{
                  backgroundColor: activeIndices.includes(idx) ? "var(--accent-color, #f59e0b)" : "#4f46e5",
                  color: "#fff",
                  boxShadow: activeIndices.includes(idx) ? "0 0 15px var(--accent-color, #f59e0b)" : "none"
                }}
              >
                {val}
              </div>
            ))}
          </div>
          <span className="text-muted ms-3 fw-bold">REAR</span>
        </div>
      );
    } else if (activeStruct === "linkedlist") {
      if (!Array.isArray(stateData)) return null;
      return (
        <div className="d-flex align-items-center justify-content-center h-100 w-100 px-4 pb-4 pt-5 flex-wrap gap-2">
          <span className="text-warning fw-bold me-2">HEAD &rarr;</span>
          {stateData.map((val, idx) => (
            <div key={idx} className="d-flex align-items-center">
              <div 
                className="px-3 py-2 rounded-pill fw-bold transition-all border border-secondary"
                style={{
                  backgroundColor: activeIndices.includes(idx) ? "var(--accent-color, #f59e0b)" : "#4f46e5",
                  color: "#fff",
                  boxShadow: activeIndices.includes(idx) ? "0 0 15px var(--accent-color, #f59e0b)" : "none"
                }}
              >
                {val}
              </div>
              {idx < stateData.length - 1 && <span className="mx-2 text-muted fw-bold">&rarr;</span>}
            </div>
          ))}
          {stateData.length > 0 && <span className="ms-2 text-muted fw-bold">&rarr; NULL</span>}
        </div>
      );
    } else if (activeStruct === "tree" || activeStruct === "graph") {
      const { nodes, edges } = stateData;
      if (!nodes || !edges) return null;
      return (
        <div className="d-flex align-items-center justify-content-center h-100 w-100 position-relative pt-5 pb-4">
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
             {edges.map((e, idx) => {
               const fromNode = nodes.find(n => n.id === e.from);
               const toNode = nodes.find(n => n.id === e.to);
               if (!fromNode || !toNode) return null;
               const isActiveEdge = activeIndices.includes(e.from) && activeIndices.includes(e.to);
               return (
                 <line 
                   key={idx} 
                   x1={`${fromNode.cx}%`} y1={`${fromNode.cy}%`} 
                   x2={`${toNode.cx}%`} y2={`${toNode.cy}%`} 
                   stroke={isActiveEdge ? "var(--accent-color, #f59e0b)" : "#6c757d"} 
                   strokeWidth={isActiveEdge ? 4 : 2}
                   className="transition-all"
                 />
               );
             })}
             {nodes.map((n, idx) => {
               const isActive = activeIndices.includes(n.id);
               return (
                 <g key={n.id} className="transition-all">
                   <circle 
                     cx={`${n.cx}%`}
                     cy={`${n.cy}%`}
                     r="20" 
                     fill={isActive ? "var(--accent-color, #f59e0b)" : "#4f46e5"}
                     stroke="#fff"
                     strokeWidth="2"
                     className="transition-all"
                     style={{ filter: isActive ? "drop-shadow(0 0 10px var(--accent-color, #f59e0b))" : "none" }}
                   />
                   <text 
                     x={`${n.cx}%`}
                     y={`${n.cy}%`}
                     textAnchor="middle" 
                     dy=".3em" 
                     fill="#fff" 
                     fontSize="14" 
                     fontWeight="bold"
                   >
                     {n.val}
                   </text>
                 </g>
               );
             })}
          </svg>
        </div>
      );
    }
  };

  return (
    <div className={`d-flex flex-column bg-dark text-white ${isFullscreen ? 'position-fixed top-0 start-0 w-100 h-100' : 'h-100'}`} style={isFullscreen ? { zIndex: 1050 } : {}}>
      {/* Top Navbar & Search */}
      <div className="d-flex align-items-center justify-content-between p-2 bg-black bg-opacity-50 border-bottom border-secondary border-opacity-25 flex-wrap">
        <div className="d-flex overflow-auto mb-2 mb-md-0" style={{ scrollbarWidth: "none" }}>
          {structs.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setActiveStruct(s.id);
                // Load corresponding algo if struct changes
                if (s.id === "linkedlist") loadAlgorithm("linked list");
                else if (s.id === "stack") loadAlgorithm("stack");
                else if (s.id === "queue") loadAlgorithm("queue");
                else if (s.id === "tree") loadAlgorithm("binary search tree");
                else if (s.id === "graph") loadAlgorithm("graph bfs");
                else loadAlgorithm("bubble sort");
              }}
              className={`btn btn-sm me-2 text-nowrap rounded-pill px-3 ${activeStruct === s.id ? "btn-accent shadow" : "btn-outline-secondary border-0"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="position-relative ms-auto d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-end" style={{ width: showSearch ? "250px" : "32px", transition: "width 0.3s ease" }}>
            {showSearch ? (
              <div className="position-relative w-100 d-flex flex-column align-items-center z-3">
                <div className="position-relative w-100 d-flex align-items-center">
                  <input 
                    type="text" 
                    className="form-control form-control-sm bg-dark border-secondary text-light ps-3 pe-4 shadow-sm" 
                    placeholder="Search Algorithm..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearch}
                    autoFocus
                  />
                  <i 
                    className="bi bi-x position-absolute top-50 end-0 translate-middle-y me-2 text-muted" 
                    style={{ cursor: "pointer" }}
                    onClick={() => { setShowSearch(false); setFilteredOptions([]); }}
                    title="Close Search"
                  ></i>
                </div>
                {filteredOptions.length > 0 && (
                  <ul className="dropdown-menu dropdown-menu-dark show position-absolute w-100 mt-5 shadow-lg border-secondary border-opacity-50" style={{ top: "0" }}>
                    {filteredOptions.map((opt, idx) => (
                      <li key={idx}>
                        <button className="dropdown-item text-capitalize" onClick={() => selectAlgorithm(opt)}>
                          <i className="bi bi-search me-2 text-muted small"></i>{opt}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <button 
                className="btn btn-sm btn-outline-secondary rounded d-flex align-items-center justify-content-center border-0" 
                style={{ width: "32px", height: "32px" }}
                onClick={() => setShowSearch(true)}
                title="Search Algorithm"
              >
                <i className="bi bi-search"></i>
              </button>
            )}
          </div>
          <button 
            className="btn btn-sm btn-outline-secondary rounded d-flex align-items-center justify-content-center" 
            style={{ width: "32px", height: "32px" }}
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <i className={`bi ${isFullscreen ? 'bi-fullscreen-exit' : 'bi-arrows-fullscreen'}`}></i>
          </button>
        </div>
      </div>

      <div className="d-flex flex-column flex-md-row flex-grow-1 overflow-hidden">
        {/* Visualization Area */}
        <div className="w-100 w-md-75 d-flex flex-column p-4">
          <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center bg-black bg-opacity-25 rounded-3 border border-secondary border-opacity-25 position-relative overflow-hidden mb-4 shadow-sm">
            
            <div className="position-absolute top-0 start-0 m-3 d-flex flex-column z-3">
               <h5 className="text-accent text-uppercase fw-bold m-0">{currentLabel}</h5>
               <small className="text-muted">Dynamic AI Visualization Engine</small>
            </div>
            
            <div className="position-absolute top-0 end-0 m-3 z-3">
              <button 
                className={`btn btn-sm ${isVoiceOn ? 'btn-info' : 'btn-outline-secondary'} rounded-pill d-flex align-items-center gap-2`}
                onClick={() => setIsVoiceOn(!isVoiceOn)}
                title="Toggle Inworld AI Voice Explanation"
              >
                 <i className={`bi ${isVoiceOn ? 'bi-volume-up-fill' : 'bi-volume-mute-fill'}`}></i>
                 <span className="fw-bold small">{isVoiceOn ? 'AI Voice: ON' : 'AI Voice: OFF'}</span>
              </button>
            </div>

            {renderVisualization()}
          </div>

          {/* Controls Area */}
          <div className="card bg-dark border-secondary border-opacity-25 shadow-sm">
            <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="btn-group shadow-sm">
                <button className="btn btn-outline-light px-3" onClick={() => { setIsPlaying(false); setStep(s => Math.max(0, s - 1)); }} disabled={step === 0} title="Previous Step">
                  <i className="bi bi-skip-backward-fill"></i>
                </button>
                <button className="btn btn-danger px-4" onClick={reset} title="Stop & Reset">
                  <i className="bi bi-stop-fill fs-5"></i>
                </button>
                <button className={`btn px-4 ${isPlaying ? 'btn-outline-accent' : 'btn-accent'}`} onClick={() => setIsPlaying(true)} disabled={isPlaying || step >= history.length - 1} title="Play">
                  <i className="bi bi-play-fill fs-5"></i>
                </button>
                <button className={`btn px-4 ${!isPlaying ? 'btn-outline-warning' : 'btn-warning'}`} onClick={() => setIsPlaying(false)} disabled={!isPlaying} title="Pause">
                  <i className="bi bi-pause-fill fs-5"></i>
                </button>
                <button className="btn btn-outline-light px-3" onClick={() => { setIsPlaying(false); setStep(s => Math.min(history.length - 1, s + 1)); }} disabled={step >= history.length - 1} title="Next Step">
                  <i className="bi bi-skip-forward-fill"></i>
                </button>
              </div>

              <div className="d-flex align-items-center gap-3">
                <label className="text-muted small fw-bold text-nowrap"><i className="bi bi-speedometer2 me-2"></i>Speed</label>
                <input 
                  type="range" 
                  className="form-range" 
                  min="0.5" max="5" step="0.5" 
                  value={speed} 
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  style={{ width: "150px" }}
                />
                <span className="badge bg-secondary">{speed}x</span>
              </div>

              <div className="d-flex align-items-center gap-2">
                 <span className="badge bg-dark border border-secondary text-light fs-6 px-3 py-2">
                    Step: {history.length > 0 ? step + 1 : 0} / {history.length}
                 </span>
                 <button className="btn btn-outline-warning shadow-sm ms-2" onClick={reset}>
                   <i className="bi bi-arrow-counterclockwise me-2"></i>Reset
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Code Area */}
        <div className="w-100 w-md-25 border-start border-secondary border-opacity-25 bg-black p-0 d-flex flex-column h-100">
          <div className="p-3 border-bottom border-secondary border-opacity-25 bg-dark">
            <h6 className="mb-0 fw-bold d-flex align-items-center text-accent">
              <i className="bi bi-code-square me-2"></i>Algorithm Logic
            </h6>
          </div>
          <div className="flex-grow-1 overflow-auto position-relative p-3 font-monospace" style={{ fontSize: "0.85rem", scrollbarWidth: "thin" }}>
            {codeSnippet.split('\n').map((line, idx) => (
              <div 
                key={idx} 
                className={`px-2 py-1 rounded d-flex ${codeLine === idx + 1 ? 'bg-accent bg-opacity-25 border-start border-3 border-accent text-white fw-bold shadow-sm' : 'text-muted'}`}
                style={{ transition: "all 0.2s" }}
              >
                <span className="opacity-50 me-3 user-select-none" style={{ width: "20px" }}>{idx + 1}</span>
                <span style={{ whiteSpace: "pre" }}>{line}</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-dark border-top border-secondary border-opacity-25">
            <span className="badge bg-danger bg-opacity-10 text-danger w-100 py-2 d-flex justify-content-between align-items-center">
              <span>Time Complexity:</span>
              <strong className="fs-6">{timeComplexity}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSAVisualizer;
