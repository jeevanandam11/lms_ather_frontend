import React, { useState } from "react";
import axios from "axios";
import Header from "../header/Header";
import "../../App.css";

const ResumeHub = ({ isSidebarOpen, toggleSidebar }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8080/api/resume/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(res.data);
    } catch (err) {
      console.error("Resume Analysis Error:", err);
      alert("Failed to analyze resume. Make sure backend is running and you uploaded a valid PDF.");
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <>
      <div className="container-fluid p-0 overflow-hidden">
        <div className="row g-0">
          <main className={`${isSidebarOpen ? "col-md-10" : "col-md-12"} vh-100 overflow-auto p-4 p-lg-5 transition-all`}>
            {/* Header preserves global navigation context */}
            <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            
            <div className="p-4 p-lg-5">
              <header className="d-flex justify-content-between align-items-center mb-5">
                <div className="d-flex align-items-center gap-3">
                  <button className="btn btn-dark border-0 rounded-3 p-2" onClick={toggleSidebar}>
                    <i className={`bi ${isSidebarOpen ? "bi-text-indent-left" : "bi-list"} fs-5 text-muted`}></i>
                  </button>
                  <h2 className="fw-bold mb-0">Resume AI Analyzer</h2>
                </div>
              </header>

              {loading ? (
                <div className="text-center py-5 my-5">
                  <div className="spinner-border text-accent mb-4" role="status" style={{ width: "3rem", height: "3rem" }}></div>
                  <h3 className="text-white">Aether is analyzing your resume...</h3>
                  <p className="text-muted">Extracting text, cross-referencing industry standards, and generating actionable feedback.</p>
                </div>
              ) : !result ? (
                /* UPLOAD STATE */
                <div 
                  className={`glass-card p-5 text-center ${isDragging ? "bg-dark bg-opacity-50" : ""}`} 
                  style={{ 
                    border: `2px dashed ${isDragging ? "var(--accent-purple)" : "rgba(255,255,255,0.2)"}`,
                    transition: "all 0.3s ease" 
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <i className={`bi bi-cloud-arrow-up display-1 ${isDragging ? "text-white" : "text-accent"} mb-4 d-block`} style={{ transition: "color 0.3s ease" }}></i>
                  <h3 className="fw-bold mb-3">Drag & Drop or Upload Your Resume</h3>
                  <p className="text-muted mb-4">Drag and drop your PDF resume here, or click to browse files to receive instant, AI-driven scoring and actionable feedback.</p>
                  
                  <input type="file" id="resumeUpload" className="d-none" accept=".pdf" onChange={handleFileChange} />
                  <label htmlFor="resumeUpload" className="btn btn-outline-light px-4 py-2 mb-3 cursor-pointer" style={{ cursor: "pointer" }}>
                    {file ? file.name : <><i className="bi bi-file-earmark-pdf me-2"></i>Select PDF File</>}
                  </label>
                  
                  {file && (
                    <div className="mt-4 fade-in">
                      <button className="btn btn-accent px-5 py-3 fw-bold fs-5 shadow-glow" onClick={handleAnalyze}>
                        Analyze Resume Now <i className="bi bi-magic ms-2"></i>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* RESULTS STATE */
                <div className="fade-in">
                  <div className="glass-card p-5 mb-4 position-relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a1d2b 0%, #121420 100%)" }}>
                    <div className="row align-items-center">
                      <div className="col-md-7">
                        <h1 className="display-5 fw-bold mb-3">Master Match Score</h1>
                        <p className="text-muted fs-5 mb-4">{result.summary || "Your resume has been evaluated successfully."}</p>

                        <div className="d-flex flex-wrap gap-2 mb-4">
                          {result.keywords?.slice(0, 5).map((kw, i) => (
                            <ScoreTag key={i} icon="bi-check-circle-fill" label={kw} color="text-success" />
                          ))}
                        </div>

                        <div className="d-flex gap-3">
                          <button className="btn btn-accent px-4 py-2 fw-bold" onClick={resetAnalysis}>
                            <i className="bi bi-upload me-2"></i>Analyze Another
                          </button>
                        </div>
                      </div>

                      <div className="col-md-5 d-flex justify-content-center">
                        <div className="position-relative">
                          <svg width="220" height="220" viewBox="0 0 220 220">
                            <circle cx="110" cy="110" r="100" fill="none" stroke="#2d334a" strokeWidth="12" />
                            <circle 
                               cx="110" cy="110" r="100" fill="none" stroke="var(--accent-purple)" strokeWidth="12" 
                               strokeDasharray="628" 
                               strokeDashoffset={628 - (628 * (result.score || 0)) / 100} 
                               strokeLinecap="round" transform="rotate(-90 110 110)" 
                               style={{ transition: "stroke-dashoffset 1.5s ease-in-out" }} 
                            />
                          </svg>
                          <div className="position-absolute top-50 start-50 translate-middle text-center">
                            <span className="display-3 fw-bold d-block">{result.score || 0}</span>
                            <span className="text-muted text-uppercase small tracking-wider">Out of 100</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-4 mb-4">
                    <div className="col-lg-6">
                      <div className="glass-card p-4 h-100">
                        <h6 className="fw-bold mb-4 text-uppercase small opacity-50"><i className="bi bi-stars me-2"></i>Actionable Improvements</h6>
                        {result.improvements?.length > 0 ? result.improvements.map((tip, idx) => (
                           <div key={idx} className="impact-box p-3 rounded mb-3 border-start border-accent border-4 bg-accent bg-opacity-10 d-flex flex-column">
                             <span className="text-light mb-1">{tip}</span>
                           </div>
                        )) : (
                           <div className="impact-box p-3 rounded border-start border-success border-4 bg-success bg-opacity-10">
                             <span className="text-light">Your resume formatting is flawless!</span>
                           </div>
                        )}
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="glass-card p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h6 className="fw-bold text-uppercase small opacity-50"><i className="bi bi-bullseye me-2"></i>Missing Skills</h6>
                        </div>
                        <div className="p-3 rounded bg-dark bg-opacity-25 border border-white border-opacity-5 mb-3 h-100">
                            <p className="text-muted small mb-3">Consider adding these high-value industry skills if you possess them:</p>
                            <div className="d-flex flex-wrap gap-2">
                              {result.missing_skills?.length > 0 ? result.missing_skills.map((s, i) => (
                                <span key={i} className="badge bg-danger bg-opacity-25 border border-danger border-opacity-50 text-light py-2 px-3 fw-normal">{s}</span>
                              )) : <span className="text-success small"><i className="bi bi-check bg-success rounded-circle text-white me-2 p-1"></i>No critically missing skills detected!</span>}
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

const ScoreTag = ({ icon, label, color }) => (
  <div className="px-3 py-2 rounded-pill bg-dark bg-opacity-50 border border-white border-opacity-10 d-flex align-items-center gap-2">
    <i className={`bi ${icon} ${color}`}></i>
    <span className="small fw-semibold">{label}</span>
  </div>
);

export default ResumeHub;
