import React, { useState, useEffect } from "react";

const QuizWorkspace = () => {
  const [difficulty, setDifficulty] = useState("Medium");
  const [timer, setTimer] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      id: 1,
      type: "MCQ",
      text: "Which of the following is true about React's useEffect hook?",
      options: [
        "It replaces the render method.",
        "It fires before the component mounts.",
        "It can be used to perform side effects in function components.",
        "It is only used for state initialization."
      ],
      correct: 2,
      explanation: "useEffect lets you perform side effects in function components, similar to componentDidMount, componentDidUpdate, and componentWillUnmount in class components."
    },
    {
      id: 2,
      type: "Scenario",
      text: "You notice that your React component is re-rendering too often, causing performance issues. What is the most appropriate hook to memoize a complex calculation?",
      options: [
        "useCallback",
        "useMemo",
        "useRef",
        "useState"
      ],
      correct: 1,
      explanation: "useMemo is used to memoize the result of a computationally expensive function, preventing it from running on every render unless its dependencies change."
    }
  ];

  const currentQ = questions[currentQuestionIndex];

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEvaluate = () => {
    if (selectedAnswer === null) return;
    setIsEvaluated(true);
    if (selectedAnswer === currentQ.correct) {
      setScore(score + 10);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsEvaluated(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  return (
    <div className="d-flex flex-column h-100 bg-dark text-white p-4 overflow-auto">
      {/* Header Info */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25 gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="btn-group shadow-sm">
            {["Easy", "Medium", "Hard"].map(level => (
              <button 
                key={level} 
                className={`btn btn-sm ${difficulty === level ? 'btn-accent' : 'btn-outline-secondary'}`}
                onClick={() => setDifficulty(level)}
                disabled={isEvaluated || currentQuestionIndex > 0}
              >
                {level}
              </button>
            ))}
          </div>
          <span className="badge bg-secondary opacity-75">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        
        <div className="d-flex gap-4 align-items-center">
          <div className="text-center">
            <div className="text-muted small fw-bold">SCORE</div>
            <div className="fs-5 fw-bold text-success">{score} <span className="text-muted fs-6">XP</span></div>
          </div>
          <div className="text-center">
            <div className="text-muted small fw-bold">TIME</div>
            <div className="fs-5 fw-bold font-monospace text-warning d-flex align-items-center gap-2">
              <i className="bi bi-clock-history"></i> {formatTime(timer)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Quiz Area */}
      <div className="flex-grow-1 d-flex flex-column">
        <div className="card bg-black border-secondary border-opacity-25 shadow-lg mb-4">
          <div className="card-header bg-transparent border-bottom border-secondary border-opacity-25 py-3">
            <span className={`badge ${currentQ.type === 'Scenario' ? 'bg-info' : 'bg-primary'} bg-opacity-25 text-light border border-secondary border-opacity-50`}>
              <i className="bi bi-tag-fill me-2"></i>{currentQ.type}
            </span>
          </div>
          <div className="card-body p-4 p-md-5">
            <h4 className="lh-base mb-4 fw-normal text-light">{currentQ.text}</h4>
            
            <div className="d-flex flex-column gap-3 mt-5">
              {currentQ.options.map((opt, idx) => {
                let btnClass = "btn-outline-secondary text-light bg-dark border-opacity-25 hover-glow";
                let iconClass = "border-secondary text-secondary";
                
                if (isEvaluated) {
                  if (idx === currentQ.correct) {
                    btnClass = "btn-success bg-success bg-opacity-10 border-success text-white";
                    iconClass = "bg-success border-success text-white";
                  } else if (idx === selectedAnswer && idx !== currentQ.correct) {
                    btnClass = "btn-danger bg-danger bg-opacity-10 border-danger text-white";
                    iconClass = "bg-danger border-danger text-white";
                  }
                } else if (selectedAnswer === idx) {
                  btnClass = "btn-accent text-white shadow";
                  iconClass = "bg-white border-white text-accent fw-bold";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !isEvaluated && setSelectedAnswer(idx)}
                    disabled={isEvaluated}
                    className={`btn p-3 text-start fs-5 d-flex align-items-center gap-3 transition-all border ${btnClass}`}
                  >
                    <div 
                      className={`rounded-circle d-flex justify-content-center align-items-center border border-2 ${iconClass}`}
                      style={{ width: "32px", height: "32px", flexShrink: 0 }}
                    >
                      {isEvaluated && idx === currentQ.correct ? <i className="bi bi-check-lg"></i> :
                       isEvaluated && idx === selectedAnswer ? <i className="bi bi-x-lg"></i> :
                       String.fromCharCode(65 + idx)}
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Explanation & Actions */}
        {isEvaluated && (
          <div className="card bg-info bg-opacity-10 border-info border-opacity-25 mb-4 shadow-sm animate-fade-in">
            <div className="card-body p-4 d-flex gap-4">
              <div className="text-info fs-1">
                <i className="bi bi-robot"></i>
              </div>
              <div>
                <h6 className="text-info fw-bold mb-2 text-uppercase d-flex align-items-center gap-2">
                  AI Explanation
                  {selectedAnswer === currentQ.correct ? 
                    <span className="badge bg-success bg-opacity-25 text-success">Correct</span> : 
                    <span className="badge bg-danger bg-opacity-25 text-danger">Incorrect</span>
                  }
                </h6>
                <p className="mb-0 text-light opacity-75 lh-lg">{currentQ.explanation}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto d-flex justify-content-end gap-3 pt-3">
          {!isEvaluated ? (
            <button 
              className="btn btn-lg btn-accent px-5 fw-bold shadow" 
              onClick={handleEvaluate}
              disabled={selectedAnswer === null}
            >
              Evaluate Answer <i className="bi bi-stars ms-2"></i>
            </button>
          ) : (
            <button 
              className="btn btn-lg btn-primary px-5 fw-bold shadow" 
              onClick={handleNext}
              disabled={currentQuestionIndex >= questions.length - 1}
            >
              Next Question <i className="bi bi-arrow-right ms-2"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizWorkspace;
