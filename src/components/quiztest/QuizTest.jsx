import React, { useState, useEffect, useRef } from "react";
import Header from "../header/Header";
import "../../App.css";
import { toPng } from "html-to-image";

const QuizTest = ({ isSidebarOpen, toggleSidebar }) => {
  const [roadmapData, setRoadmapData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [savingCert, setSavingCert] = useState(false);
  const [certMessage, setCertMessage] = useState("");
  const certRef = useRef(null);

  useEffect(() => {
    const data = localStorage.getItem("placementRoadmap");
    if (data) {
      try {
        setRoadmapData(JSON.parse(data));
      } catch (e) {
        console.error("Failed to parse roadmap data", e);
      }
    }
  }, []);

  const handleGenerateQuiz = async () => {
    if (!roadmapData) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    setIsFinished(false);
    setSelectedAnswers({});
    setCurrentQuestion(0);
    try {
      const response = await fetch(
        "http://localhost:8080/api/resume/generate-quiz",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(roadmapData),
        },
      );
      if (!response.ok)
        throw new Error("Failed to generate quiz. Please try again.");
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        setError("AI structured response failed. Please try again.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (oIndex) => {
    if (isFinished) return;
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: oIndex });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount * 10);
    setIsFinished(true);
  };

  const handleCaptureCertificate = async () => {
    if (!certRef.current) return;
    setSavingCert(true);
    setCertMessage("");
    try {
      const dataUrl = await toPng(certRef.current, { quality: 1.0 });
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await fetch("http://localhost:8080/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          courseName: "Aether AI Placement Simulator",
          imageBase64: dataUrl,
        }),
      });

      if (!response.ok) throw new Error("Database persistence failed.");
      setCertMessage(
        "Certificate generated and stored successfully! Check 'My Certificate' in the sidebar.",
      );
    } catch (err) {
      setCertMessage("Error: " + err.message);
    } finally {
      setSavingCert(false);
    }
  };

  return (
    <div className="container-fluid p-0 overflow-hidden">
      <div className="row g-0">
        <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main
          className={`${isSidebarOpen ? "col-md-12" : "col-md-12"} vh-100 overflow-auto p-4 p-lg-5 transition-all mar-top-space`}
        >
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold mb-4">Mock Interview Quiz Test</h1>
            <p className="text-light">
              Test your placement readiness natively.
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            {!roadmapData ? (
              <div className="col-lg-8 mb-4">
                <div className="glass-card p-5 text-center">
                  <h4 className="text-light">No Placement Roadmap Found</h4>
                  <p className="small mt-3">
                    Please use the Placement Guide initialization step first!
                  </p>
                  <button
                    className="btn btn-outline-accent mt-3"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent("navigate", { detail: "placement" }),
                      )
                    }
                  >
                    Go To Guide
                  </button>
                </div>
              </div>
            ) : questions.length === 0 ? (
              <div className="col-lg-8 text-center mt-5">
                <div className="glass-card p-5">
                  <i className="bi bi-robot display-4 text-accent mb-3"></i>
                  <h4>Generate Custom AI Mock Test</h4>

                  <button
                    className="btn btn-accent px-5 py-3 fw-bold tracking-wider mt-3"
                    onClick={handleGenerateQuiz}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        Processing Context Space{" "}
                        <span className="spinner-border spinner-border-sm ms-2"></span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-play-circle-fill me-2"></i> Start
                        Quiz Sequence
                      </>
                    )}
                  </button>
                  {error && (
                    <div className="alert alert-danger mt-4" role="alert">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            ) : isFinished ? (
              <div className="col-lg-12 animate-fade-in text-center">
                <div className="glass-card p-5 border border-success border-opacity-50">
                  <h2 className="fw-bold mb-4">Evaluation Complete</h2>
                  <div className="position-relative d-inline-block mb-4">
                    <div
                      className="progress-circle bg-dark shadow-glow rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "150px",
                        height: "150px",
                        border: `8px solid ${score >= 70 ? "var(--accent-green)" : score >= 40 ? "var(--accent)" : "#dc3545"}`,
                      }}
                    >
                      <span className="fw-bold display-4">{score}</span>
                      <span
                        className="small text-muted position-absolute"
                        style={{ bottom: "25px" }}
                      >
                        / 100
                      </span>
                    </div>
                  </div>
                  <h4
                    className={`fw-bold ${score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-danger"}`}
                  >
                    {score >= 70
                      ? "Ready for Tier-1 Roles!"
                      : score >= 40
                        ? "Needs More Polish"
                        : "Back to Basics"}
                  </h4>
                  <p className="mt-2 text-muted">
                    You have successfully cleared the placement assessment
                    protocols.
                  </p>

                  <div className="mt-5 d-flex justify-content-center">
                    <div
                      ref={certRef}
                      className="position-relative shadow-lg border border-5 border-light p-4"
                      style={{
                        width: "800px",
                        height: "565px",
                        fontFamily: "'Inter', sans-serif",
                        background:
                          "linear-gradient(135deg, #fdfbfb 0%, #f4f0fa 100%)",
                      }}
                    >
                      {/* Double Inner Border Design */}
                      <div
                        className="h-100 position-relative p-2"
                        style={{ border: "4px solid #2D0845" }}
                      >
                        <div
                          className="h-100 p-4 d-flex flex-column justify-content-center position-relative"
                          style={{
                            border: "2px solid #D4AF37",
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                          }}
                        >
                          {/* Corner Decorations */}
                          <div
                            className="position-absolute top-0 start-0 m-2"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderTop: "4px solid #D4AF37",
                              borderLeft: "4px solid #D4AF37",
                            }}
                          ></div>
                          <div
                            className="position-absolute top-0 end-0 m-2"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderTop: "4px solid #D4AF37",
                              borderRight: "4px solid #D4AF37",
                            }}
                          ></div>
                          <div
                            className="position-absolute bottom-0 start-0 m-2"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderBottom: "4px solid #D4AF37",
                              borderLeft: "4px solid #D4AF37",
                            }}
                          ></div>
                          <div
                            className="position-absolute bottom-0 end-0 m-2"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderBottom: "4px solid #D4AF37",
                              borderRight: "4px solid #D4AF37",
                            }}
                          ></div>

                          {/* Watermark Logo
                          <div className="position-absolute top-50 start-50 translate-middle opacity-10">
                            <i className="bi bi-award-fill" style={{ fontSize: "28rem", color: "#2D0845" }}></i>
                          </div> */}

                          <div className="text-center position-relative z-1 pt-3">
                            <div
                              className="d-inline-block px-4 py-1 mb-4"
                              style={{
                                backgroundColor: "#2D0845",
                                color: "#D4AF37",
                                borderRadius: "50px",
                                letterSpacing: "3px",
                                fontSize: "0.85rem",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                              }}
                            >
                              Official Verification
                            </div>

                            <h1
                              className="display-3 fw-bolder text-uppercase mb-1"
                              style={{
                                color: "#2D0845",
                                letterSpacing: "4px",
                                textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                              }}
                            >
                              Certificate
                            </h1>
                            <h4
                              className="fw-light text-uppercase mb-4"
                              style={{ letterSpacing: "8px", color: "#D4AF37" }}
                            >
                              Of Achievement
                            </h4>

                            <p
                              className="mb-2 fw-bold text-uppercase tracking-widest small"
                              style={{ color: "#2D0845", opacity: "0.8" }}
                            >
                              This is proudly presented to
                            </p>

                            <h2
                              className="display-4 fw-bold mb-3 mt-2"
                              style={{
                                fontFamily:
                                  "'Brush Script MT', 'Great Vibes', cursive",
                                color: "#2D0845",
                                padding: "10px 40px",
                                display: "inline-block",
                                borderBottom: "2px solid #D4AF37",
                                position: "relative",
                              }}
                            >
                              {
                                JSON.parse(localStorage.getItem("user"))
                                  ?.firstName
                              }{" "}
                              {
                                JSON.parse(localStorage.getItem("user"))
                                  ?.lastName
                              }
                              <i
                                className="bi bi-star-fill position-absolute"
                                style={{
                                  color: "#D4AF37",
                                  fontSize: "12px",
                                  top: "100%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  backgroundColor: "transparent",
                                  padding: "0 5px",
                                }}
                              ></i>
                            </h2>

                            <p
                              className="mx-auto px-5 mb-4 mt-2"
                              style={{
                                lineHeight: "1.8",
                                maxWidth: "650px",
                                color: "#444",
                                fontSize: "0.95rem",
                              }}
                            >
                              For successfully completing the comprehensive{" "}
                              <strong style={{ color: "#2D0845" }}>
                                Aether AI Guided Placement Assessment
                              </strong>{" "}
                              <br />
                              and achieving a validated score of{" "}
                              <span className="badge bg-success ms-1 fs-6">
                                {score}/100
                              </span>
                              .
                            </p>

                            <div className="row mt-4 pt-2 align-items-center w-100 mx-0">
                              <div className="col-4 text-center">
                                <h5
                                  className="mb-0 fw-bold"
                                  style={{
                                    color: "#2D0845",
                                    fontSize: "1.1rem",
                                  }}
                                >
                                  {new Date().toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </h5>
                                <div
                                  className="border-top border-2 mt-2 pt-2 small text-uppercase mx-4 fw-bold"
                                  style={{
                                    borderColor: "#D4AF37",
                                    color: "#888",
                                    letterSpacing: "1px",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  Issuance Date
                                </div>
                              </div>
                              <div className="col-4 text-center">
                                <div
                                  className="d-inline-flex bg-white rounded-circle align-items-center justify-content-center shadow-sm p-4 position-relative"
                                  style={{ border: "3px solid #D4AF37" }}
                                >
                                  <i
                                    className="bi bi-check-circle-fill fs-2"
                                    style={{ color: "#2D0845" }}
                                  ></i>
                                </div>
                              </div>
                              <div className="col-4 text-center">
                                <h5
                                  className="mb-0 fw-bold"
                                  style={{
                                    fontFamily: "'Brush Script MT', cursive",
                                    color: "#2D0845",
                                    fontSize: "2rem",
                                  }}
                                >
                                  Aether OS
                                </h5>
                                <div
                                  className="border-top border-2 mt-2 pt-2 small text-uppercase mx-4 fw-bold"
                                  style={{
                                    borderColor: "#D4AF37",
                                    color: "#888",
                                    letterSpacing: "1px",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  System Director
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      className="btn btn-accent px-5 py-3 fw-bold"
                      onClick={handleCaptureCertificate}
                      disabled={savingCert}
                    >
                      {savingCert ? (
                        "Generating Certificate..."
                      ) : (
                        <>
                          <i className="bi bi-award-fill me-2"></i> Save
                          Verified Certificate to Profile
                        </>
                      )}
                    </button>
                    {certMessage && (
                      <p className="mt-3 text-success fw-bold">{certMessage}</p>
                    )}
                  </div>

                  <button
                    className="btn btn-outline-light mt-4 d-block mx-auto"
                    onClick={handleGenerateQuiz}
                  >
                    Retake with New Questions
                  </button>
                </div>
              </div>
            ) : (
              <div className="col-lg-8 animate-fade-in">
                <div className="glass-card p-4 mb-4 d-flex justify-content-between align-items-center">
                  <span className="text-light fw-bold">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <div className="progress w-50" style={{ height: "10px" }}>
                    <div
                      className="progress-bar bg-accent text-light"
                      role="progressbar"
                      style={{
                        width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="glass-card p-5 border border-accent border-opacity-10">
                  <h4 className="fw-bold mb-4">
                    {questions[currentQuestion].question}
                  </h4>

                  <div className="d-flex flex-column gap-3 mt-4">
                    {questions[currentQuestion].options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded border cursor-pointer transition-all ${selectedAnswers[currentQuestion] === index ? "bg-accent bg-opacity-25 border-accent" : "bg-dark border-secondary bg-opacity-50 hover-glow"}`}
                        onClick={() => handleOptionSelect(index)}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className={`rounded-circle border d-flex align-items-center justify-content-center ${selectedAnswers[currentQuestion] === index ? "bg-accent border-accent" : "border-secondary"}`}
                            style={{ width: "24px", height: "24px" }}
                          >
                            {selectedAnswers[currentQuestion] === index && (
                              <i
                                className="bi bi-check text-white"
                                style={{
                                  fontSize: "1.2rem",
                                  marginTop: "-1px",
                                }}
                              ></i>
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between mt-5 pt-3 border-top border-secondary border-opacity-25">
                    <button
                      className="btn btn-outline-secondary px-4"
                      onClick={handlePrev}
                      disabled={currentQuestion === 0}
                    >
                      Previous
                    </button>
                    {currentQuestion === questions.length - 1 ? (
                      <button
                        className={`btn px-5 fw-bold ${selectedAnswers[currentQuestion] !== undefined ? "btn-success" : "btn-secondary disabled"}`}
                        onClick={calculateScore}
                        disabled={
                          selectedAnswers[currentQuestion] === undefined
                        }
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <button
                        className="btn btn-accent px-5"
                        onClick={handleNext}
                        disabled={
                          selectedAnswers[currentQuestion] === undefined
                        }
                      >
                        Next <i className="bi bi-arrow-right ms-2"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizTest;
