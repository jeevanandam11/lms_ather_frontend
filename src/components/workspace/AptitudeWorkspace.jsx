import React, { useState, useEffect } from "react";
import axios from "axios";

const CalculatorModal = ({ isOpen, onClose }) => {
  const [calcInput, setCalcInput] = useState("");
  if (!isOpen) return null;

  const handleBtn = (val) => {
    if (val === "=") {
      try {
        // eslint-disable-next-line no-eval
        setCalcInput(eval(calcInput).toString());
      } catch (e) {
        setCalcInput("Error");
      }
    } else if (val === "C") {
      setCalcInput("");
    } else {
      setCalcInput((prev) => (prev === "Error" ? val : prev + val));
    }
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content bg-dark border-secondary shadow-lg">
          <div className="modal-header border-bottom border-secondary border-opacity-25 p-3">
            <h6 className="modal-title text-light m-0"><i className="bi bi-calculator me-2"></i>Calculator</h6>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-3">
            <input type="text" className="form-control bg-black text-light border-secondary mb-3 text-end fs-5 font-monospace" value={calcInput} readOnly placeholder="0" />
            <div className="row g-2">
              {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(btn => (
                <div className="col-3" key={btn}>
                  <button 
                    className={`btn w-100 fw-bold ${btn === '=' || btn === 'C' ? 'btn-accent text-white' : ['/','*','-','+'].includes(btn) ? 'btn-outline-warning' : 'btn-outline-secondary text-light'}`}
                    onClick={() => handleBtn(btn)}
                  >
                    {btn}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AptitudeWorkspace = ({ topic }) => {
  const [timer, setTimer] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [difficulty, setDifficulty] = useState("Medium");
  const [scratchpad, setScratchpad] = useState("");
  const [calcOpen, setCalcOpen] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  const [questionsData, setQuestionsData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    let interval;
    if (isStarted && !showResults) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, showResults]);

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    setQuestionsData([]);
    setCurrentIndex(0);
    setUserAnswers(new Array(10).fill(null));
    setShowHint(false);
    setShowResults(false);
    setTimer(0);
    
    try {
      const prompt = `Generate exactly 10 multiple-choice questions purely related to the aptitude topic: "${topic || 'Quantitative Aptitude'}", with difficulty level: "${difficulty}". 
You must return ONLY a JSON array of 10 objects. Do not wrap in markdown.
Format strictly as:
[
  {
    "category": "${topic || 'General Aptitude'}",
    "difficulty": "${difficulty}",
    "text": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "aiHint": "Brief hint to guide the user",
    "shortcut": "Quick trick or formula",
    "stepByStep": ["Step 1", "Step 2"]
  }
]`;
      const res = await axios.post("http://localhost:8080/api/ai/chat", {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      let text = res.data.text;
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const startIndex = text.indexOf('[');
      const endIndex = text.lastIndexOf(']');
      if (startIndex !== -1 && endIndex !== -1) {
        text = text.substring(startIndex, endIndex + 1);
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestionsData(parsed);
          setUserAnswers(new Array(parsed.length).fill(null));
        } else {
           throw new Error("Invalid array");
        }
      } else {
        throw new Error("Invalid JSON response");
      }
    } catch (err) {
      console.error("Failed to generate questions:", err);
      // Fallback
      setQuestionsData([{
        category: topic || "Aptitude",
        difficulty: difficulty,
        text: `Failed to load a ${difficulty} test for ${topic || 'Aptitude'}. Please try again.`,
        options: ["A", "B", "C", "D"],
        correct: 0,
        aiHint: "Network Error.",
        shortcut: "N/A",
        stepByStep: ["N/A"]
      }]);
      setUserAnswers([null]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleStart = () => {
    setIsStarted(true);
    if (questionsData.length === 0) {
      fetchQuestions();
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentQ = questionsData[currentIndex];

  const handleOptionSelect = (idx) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = idx;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    setShowHint(false);
    if (currentIndex < questionsData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    const correctCount = userAnswers.filter((ans, i) => ans === questionsData[i].correct).length;
    const incorrectQuestions = questionsData.filter((q, i) => userAnswers[i] !== q.correct);

    return (
      <div className="d-flex flex-column h-100 bg-dark text-white p-4 overflow-auto">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25">
          <h4 className="m-0 text-accent fw-bold"><i className="bi bi-award me-2"></i>Test Results</h4>
          <button className="btn btn-outline-light" onClick={() => { setIsStarted(false); setShowResults(false); setQuestionsData([]); }}>
             <i className="bi bi-arrow-repeat me-2"></i>Retake Test
          </button>
        </div>

        <div className="row mb-5">
           <div className="col-md-6 mx-auto text-center">
              <div className="p-4 bg-black bg-opacity-25 rounded-circle d-inline-flex flex-column justify-content-center align-items-center border border-5 border-opacity-25" style={{ width: "200px", height: "200px", borderColor: correctCount > questionsData.length / 2 ? '#10b981' : '#f43f5e' }}>
                 <span className="fs-1 fw-bold">{correctCount} <span className="fs-3 text-muted">/ {questionsData.length}</span></span>
                 <small className="text-uppercase tracking-widest text-muted mt-2">Score</small>
              </div>
           </div>
        </div>

        {incorrectQuestions.length > 0 ? (
          <div>
            <h5 className="mb-4 text-warning"><i className="bi bi-exclamation-triangle me-2"></i>Learning Guide (Incorrect Answers)</h5>
            {incorrectQuestions.map((q, idx) => {
              const originalIndex = questionsData.indexOf(q);
              const uAns = userAnswers[originalIndex];
              return (
                <div key={idx} className="card bg-black border-secondary border-opacity-25 mb-4 shadow-sm">
                  <div className="card-header bg-dark border-bottom border-secondary border-opacity-25 py-3">
                    <span className="badge bg-secondary me-2">Q{originalIndex + 1}</span>
                    <strong>{q.text}</strong>
                  </div>
                  <div className="card-body p-4 text-light opacity-75">
                    <div className="row mb-3">
                      <div className="col-md-6">
                         <div className="p-2 rounded bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
                            <strong>Your Answer:</strong> {uAns !== null ? q.options[uAns] : "Not Attempted"}
                         </div>
                      </div>
                      <div className="col-md-6">
                         <div className="p-2 rounded bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                            <strong>Correct Answer:</strong> {q.options[q.correct]}
                         </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h6 className="text-info"><i className="bi bi-lightbulb-fill text-warning me-2"></i>Explanation</h6>
                      <p className="mb-3">{q.aiHint}</p>
                      {q.stepByStep && q.stepByStep.length > 0 && (
                        <div className="bg-dark bg-opacity-50 p-3 rounded">
                          <strong className="d-block mb-2 text-muted small text-uppercase">Step by Step</strong>
                          <ol className="mb-0 ps-3">
                            {q.stepByStep.map((step, sIdx) => <li key={sIdx} className="mb-1">{step}</li>)}
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center mt-5">
             <i className="bi bi-trophy text-warning" style={{ fontSize: "5rem" }}></i>
             <h3 className="mt-3">Perfect Score!</h3>
             <p className="text-muted">You have mastered this topic.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100 bg-dark text-white p-4 overflow-auto position-relative">
      <CalculatorModal isOpen={calcOpen} onClose={() => setCalcOpen(false)} />

      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="d-flex gap-2 align-items-center">
          <span className="badge bg-accent bg-opacity-25 text-accent px-3 py-2 border border-accent border-opacity-25">
            {topic || "Aptitude"}
          </span>
          <select 
            className="form-select form-select-sm bg-dark text-warning border-warning border-opacity-50 shadow-none"
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              if (isStarted) {
                setTimeout(() => fetchQuestions(), 0);
              }
            }}
            disabled={loadingQuestions}
            style={{ width: "auto", cursor: "pointer" }}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div className="d-flex gap-3 align-items-center">
          {questionsData.length > 0 && !loadingQuestions && (
             <span className="fw-bold text-muted me-2">Q {currentIndex + 1} / {questionsData.length}</span>
          )}
          <button className="btn btn-sm btn-outline-secondary" title="Calculator" onClick={() => setCalcOpen(true)}>
            <i className="bi bi-calculator"></i>
          </button>
          <div className="fs-4 fw-bold font-monospace text-warning d-flex align-items-center gap-2">
            <i className="bi bi-stopwatch"></i> {formatTime(timer)}
          </div>
        </div>
      </div>

      {!isStarted ? (
        <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1">
          <i className="bi bi-journal-text text-accent mb-3" style={{ fontSize: "4rem", opacity: 0.8 }}></i>
          <h4 className="mb-3">Ready to Practice {topic}?</h4>
          <p className="text-muted mb-4 text-center" style={{ maxWidth: "400px" }}>
            The AI will dynamically generate a 10-question {difficulty.toLowerCase()} test tailored to the topic you are learning.
          </p>
          <button className="btn btn-accent px-5 py-2 fs-5 fw-bold shadow" onClick={handleStart}>
            <i className="bi bi-play-circle-fill me-2"></i>Start Test
          </button>
        </div>
      ) : loadingQuestions ? (
        <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1">
          <div className="spinner-border text-accent mb-3" role="status"></div>
          <p className="text-muted">Generating 10 AI Questions...</p>
        </div>
      ) : currentQ ? (
        <>
          {/* Question Area */}
          <div className="card bg-black border-secondary border-opacity-25 mb-4 shadow-sm">
            <div className="card-body p-4">
              <h5 className="lh-base mb-0">{currentQ.text}</h5>
            </div>
          </div>

          {/* Main Grid: Options & Scratchpad */}
          <div className="row g-4 mb-4 flex-grow-1">
            {/* Options */}
            <div className="col-md-6 d-flex flex-column gap-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = userAnswers[currentIndex] === idx;
                let btnClass = isSelected 
                   ? "btn-accent text-white border-0 shadow" 
                   : "btn-outline-secondary text-light bg-black bg-opacity-50 border-opacity-25 hover-glow";
                let circleClass = isSelected 
                   ? "border-white bg-white text-accent fw-bold" 
                   : "border-secondary text-secondary";

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`btn p-3 text-start fs-5 d-flex align-items-center gap-3 transition-all ${btnClass}`}
                  >
                    <div 
                      className={`rounded-circle d-flex justify-content-center align-items-center border border-2 ${circleClass}`}
                      style={{ width: "30px", height: "30px", flexShrink: 0 }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    {opt}
                  </button>
                );
              })}
              
              <button 
                className={`btn fw-bold py-3 mt-auto shadow ${currentIndex === questionsData.length - 1 ? 'btn-success' : 'btn-accent'}`}
                onClick={handleNext}
                disabled={userAnswers[currentIndex] === null}
              >
                {currentIndex === questionsData.length - 1 ? "Submit Test" : "Next Question"} 
                <i className={`bi ${currentIndex === questionsData.length - 1 ? 'bi-check-circle' : 'bi-arrow-right'} ms-2`}></i>
              </button>
            </div>

            {/* Scratchpad */}
            <div className="col-md-6 d-flex flex-column h-100">
              <label className="text-muted small fw-bold mb-2 text-uppercase d-flex justify-content-between">
                <span><i className="bi bi-pencil-square me-2"></i>Scratchpad</span>
                <button className="btn btn-sm text-muted p-0" onClick={() => setScratchpad("")}>Clear</button>
              </label>
              <textarea
                className="form-control bg-black text-warning border-secondary border-opacity-25 shadow-none flex-grow-1 font-monospace p-3"
                placeholder="Type your rough work here..."
                value={scratchpad}
                onChange={(e) => setScratchpad(e.target.value)}
                style={{ resize: "none" }}
              ></textarea>
            </div>
          </div>
          
          <div className="d-flex justify-content-end mb-2">
             <button className="btn btn-link text-info text-decoration-none" onClick={() => setShowHint(!showHint)}>
                <i className="bi bi-lightbulb"></i> {showHint ? "Hide Hint" : "Need a Hint?"}
             </button>
          </div>
          
          {showHint && (
             <div className="p-3 bg-info bg-opacity-10 border border-info border-opacity-25 rounded mb-3 text-light text-sm">
                <i className="bi bi-info-circle-fill text-info me-2"></i> {currentQ.aiHint}
             </div>
          )}

        </>
      ) : null}
    </div>
  );
};

export default AptitudeWorkspace;
