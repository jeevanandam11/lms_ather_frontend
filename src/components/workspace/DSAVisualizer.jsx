import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { findAlgorithm } from "./dsaRegistry";

const DSAVisualizer = ({ topic }) => {
  const [activeStruct, setActiveStruct] = useState("array");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.5);
  const [isVoiceOn, setIsVoiceOn] = useState(true);
  
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
    }
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
            contents: [{ role: "user", parts: [{ text: `Explain this algorithmic step briefly: ${currentStepObj.description}` }] }]
          });
          explText = res.data.text || res.data.explanation || currentStepObj.description;
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
    { id: "queue", label: "Queue" }
  ];

  const renderVisualization = () => {
    if (activeStruct === "array") {
      return (
        <div className="d-flex align-items-end justify-content-center gap-2 h-75 w-100 px-4 pb-4">
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
      return (
        <div className="d-flex flex-column align-items-center justify-content-end h-75 w-100 pb-4">
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
      return (
        <div className="d-flex align-items-center justify-content-center h-75 w-100 px-4 pb-4">
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
      return (
        <div className="d-flex align-items-center justify-content-center h-75 w-100 px-4 pb-4 flex-wrap gap-2">
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
    }
  };

  return (
    <div className="d-flex flex-column h-100 bg-dark text-white">
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
                else loadAlgorithm("bubble sort");
              }}
              className={`btn btn-sm me-2 text-nowrap rounded-pill px-3 ${activeStruct === s.id ? "btn-accent shadow" : "btn-outline-secondary border-0"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="position-relative ms-auto" style={{ minWidth: "250px" }}>
          <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"></i>
          <input 
            type="text" 
            className="form-control form-control-sm bg-dark border-secondary text-light ps-4" 
            placeholder="Search Algorithm... (e.g. Selection Sort)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
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
            
            {/* AI Explanation Panel inside Visualizer */}
            <div className="position-absolute bottom-0 w-100 p-3 bg-dark bg-opacity-75 border-top border-secondary border-opacity-25 text-center transition-all">
              <p className="m-0 fs-5 text-light fw-bold">
                {isPlaying ? (
                   <><i className="bi bi-magic text-warning me-2"></i> {description}</>
                ) : (
                   <><i className="bi bi-pause-circle text-muted me-2"></i> {description || "Paused."}</>
                )}
              </p>
            </div>
          </div>

          {/* Controls Area */}
          <div className="card bg-dark border-secondary border-opacity-25 shadow-sm">
            <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="btn-group shadow-sm">
                <button className="btn btn-outline-light px-4" onClick={() => { setIsPlaying(false); setStep(s => Math.max(0, s - 1)); }} disabled={step === 0}>
                  <i className="bi bi-skip-backward-fill"></i>
                </button>
                <button className={`btn px-5 ${isPlaying ? 'btn-danger' : 'btn-accent'}`} onClick={() => setIsPlaying(!isPlaying)}>
                  <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'} fs-5`}></i>
                </button>
                <button className="btn btn-outline-light px-4" onClick={() => { setIsPlaying(false); setStep(s => Math.min(history.length - 1, s + 1)); }} disabled={step >= history.length - 1}>
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
