import React, { useState, useEffect } from "react";
import "../../App.css";
import Header from "../header/Header";

const LearningLab = ({ isSidebarOpen, toggleSidebar }) => {
  const [roadmapData, setRoadmapData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem("placementRoadmap");
    if (data) {
      try {
        setRoadmapData(JSON.parse(data));
      } catch (e) {
        console.error("Failed to parse roadmap data", e);
      }
    }

    const historyData = localStorage.getItem("placementRoadmapHistory");
    if (historyData) {
      try {
        setHistory(JSON.parse(historyData));
      } catch (e) {
        console.error("Failed to parse roadmap history", e);
      }
    }
  }, []);

  const handleDeleteHistory = (id) => {
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(
      "placementRoadmapHistory",
      JSON.stringify(updatedHistory),
    );
  };

  return (
    <>
      <div className="container-fluid p-0 overflow-hidden">
        <div className="row g-0">
          {/* Header */}
          <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          {/* Main Content */}
          <main
            className={`${isSidebarOpen ? "col-md-12" : "col-md-12"} vh-100 overflow-auto p-4 p-lg-5 transition-all mar-top-space`}
          >
            <div className="p-4 p-lg-5">
              <div className="row g-4">
                <div className="col-lg-12">
                  <div className="glass-card p-4 mb-4 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-4">
                      <div
                        className="progress-circle"
                        style={{
                          background:
                            "conic-gradient(var(--accent-green) 85%, #2d334a 0)",
                        }}
                      >
                        <span className="fw-bold fs-4">85%</span>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">Job Readiness Score</h5>
                        <p className="text-muted small mb-0">
                          You are in the top 5% of candidates for Tier-1 roles.
                        </p>
                        <span className="badge bg-success bg-opacity-10 text-success mt-2">
                          +12% from last week
                        </span>
                      </div>
                    </div>
                    <div className="text-end">
                      <label className="text-muted small d-block mb-2">
                        TARGET COMPANY
                      </label>
                      <select className="form-select bg-dark border-secondary border-opacity-25 text-white shadow-none">
                        <option>Google (L4 SWE)</option>
                      </select>
                    </div>
                  </div>

                  {roadmapData ? (
                    <div className="glass-card p-4 mb-4">
                      <h6 className="text-uppercase fw-bold small mb-4 opacity-50">
                        AI Generated Placement Roadmap
                      </h6>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        <span className="badge bg-success bg-opacity-10 text-success">
                          Skills Found:{" "}
                          {roadmapData.skills_identified?.length || 0}
                        </span>
                        <span className="badge bg-warning bg-opacity-10 text-warning">
                          Skill Gaps: {roadmapData.skill_gaps?.length || 0}
                        </span>
                      </div>

                      {["beginner", "intermediate", "advanced"].map(
                        (level) =>
                          roadmapData.roadmap?.[level] &&
                          roadmapData.roadmap[level].length > 0 && (
                            <div key={level} className="mb-3">
                              <span className="small fw-bold text-uppercase text-orange d-block mb-2">
                                {level} Phase
                              </span>
                              <div className="d-flex gap-2 flex-wrap">
                                {roadmapData.roadmap[level].map((topic, i) => (
                                  <span
                                    key={i}
                                    className="badge bg-dark border border-secondary border-opacity-25 px-3 py-2 hover-glow"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      (window.location.href = `/?view=player&topic=${encodeURIComponent(topic)}`)
                                    }
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ),
                      )}
                    </div>
                  ) : (
                    <div className="glass-card p-4 mb-4">
                      <h6 className="text-uppercase fw-bold small mb-4 opacity-50">
                        Placement Roadmap
                      </h6>
                      <div className="text-center py-3">
                        <p className="text-muted small mb-3">
                          No roadmap found. Initialize your journey in the
                          Placement Guide.
                        </p>
                        <button
                          className="btn btn-sm btn-outline-accent"
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent("navigate", {
                                detail: "placement",
                              }),
                            )
                          }
                        >
                          Go to Placement Guide
                        </button>
                      </div>
                    </div>
                  )}

                  {history.length > 0 && (
                    <div className="glass-card p-4 mb-4">
                      <h6 className="text-uppercase fw-bold small mb-4 opacity-50">
                        Placement Roadmap History
                      </h6>
                      <ul className="list-group list-group-flush bg-transparent">
                        {history.map((item) => (
                          <li
                            key={item.id}
                            className="list-group-item bg-transparent text-white border-secondary border-opacity-25 d-flex justify-content-between align-items-center px-0"
                          >
                            <div>
                              <div className="fw-bold">
                                {item.targetRole}{" "}
                                <span className="badge bg-secondary ms-2 small">
                                  Saved
                                </span>
                              </div>
                              <small className="text-muted">{item.date}</small>
                            </div>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-accent py-0 shadow-none"
                                onClick={() => setRoadmapData(item.data)}
                              >
                                View
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger py-0 d-flex align-items-center shadow-none"
                                onClick={() => handleDeleteHistory(item.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="glass-card overflow-hidden mb-4">
                    <div className="p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                      <div>
                        <h4 className="fw-bold mb-1">
                          <i className="bi bi-ui-checks-grid me-2 text-accent"></i>{" "}
                          Placement Mock Quiz
                        </h4>
                        <p className="text-muted small mb-0">
                          Evaluate your skills algorithmically based on your
                          generated roadmap topics.
                        </p>
                      </div>
                      <button
                        className="btn btn-accent px-4 py-2"
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent("navigate", { detail: "quiz" }),
                          )
                        }
                      >
                        <i className="bi bi-play-circle-fill me-2"></i> Take
                        Assesment
                      </button>
                    </div>
                  </div>

                  <div
                    className="glass-card overflow-hidden"
                    style={{ border: "1px solid #8a70ff" }}
                  >
                    <div className="p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                      <div>
                        <h4 className="fw-bold mb-1 text-white">
                          <i className="bi bi-mic-fill me-2 text-accent"></i>{" "}
                          Placement Mock Interview
                        </h4>
                        <p className="text-muted small mb-0">
                          Practice your speaking skills with an AI interviewer
                          tailored strictly to your placement guide target role.
                        </p>
                      </div>
                      <button
                        className="btn px-4 py-2 text-white"
                        style={{ backgroundColor: "#8a70ff" }}
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent("navigate", {
                              detail: "mockInterview",
                            }),
                          )
                        }
                      >
                        <i className="bi bi-mic me-2"></i> Take Mock Interview
                      </button>
                    </div>
                  </div>
                </div>

                {/* <div className="col-lg-4">
                  <div
                    className="glass-card p-4 mb-4"
                    style={{
                      background:
                        "linear-gradient(135deg, #1a1d2b 0%, #251b4d 100%)",
                    }}
                  >
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-lightning-fill text-accent me-2"></i>
                      Next Action Item
                    </h6>
                    <p className="small text-muted">
                      Complete System Design Mock to reach 90% score for Google.
                    </p>
                    <button className="btn btn-accent w-100 py-2 fw-bold mt-2">
                      Start Session
                    </button>
                  </div>

                  <div className="glass-card p-4 mb-4">
                    <h6 className="fw-bold small mb-3 text-uppercase opacity-50">
                      <i className="bi bi-envelope me-2"></i>Cold Outreach Tools
                    </h6>
                    <OutreachTemplate
                      title="Recruiter Follow-up"
                      body="Dear [Name], I'm reaching out regarding..."
                    />
                    <OutreachTemplate
                      title="Alumni Networking"
                      body="Hi [Name], as a fellow Aether alumni..."
                    />
                    <button className="btn btn-outline-secondary w-100 btn-sm mt-2">
                      Generate Custom AI Draft
                    </button>
                  </div>

                  <div className="glass-card p-4">
                    <h6 className="fw-bold small mb-3 text-uppercase opacity-50">
                      <i className="bi bi-graph-up me-2"></i>Salary Insights
                    </h6>
                    <div
                      className="bg-dark rounded p-4 mb-3"
                      style={{ height: "150px" }}
                    >
                      <div className="d-flex align-items-end justify-content-between h-100 gap-2">
                        <div
                          className="bg-accent bg-opacity-25 w-100"
                          style={{ height: "40%" }}
                        ></div>
                        <div
                          className="bg-accent bg-opacity-50 w-100"
                          style={{ height: "70%" }}
                        ></div>
                        <div
                          className="bg-accent w-100"
                          style={{ height: "100%" }}
                        ></div>
                        <div
                          className="bg-accent bg-opacity-75 w-100"
                          style={{ height: "80%" }}
                        ></div>
                        <div
                          className="bg-accent bg-opacity-25 w-100"
                          style={{ height: "30%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-muted">Target Role Average</span>
                      <span className="fw-bold">$205,000</span>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

const RoadmapStep = ({ icon, label, status, active, highlight, muted }) => (
  <div
    className="text-center position-relative"
    style={{ zIndex: 2, width: "100px" }}
  >
    <div
      className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center shadow-lg ${active ? "bg-success" : highlight ? "bg-accent" : "bg-dark border border-secondary border-opacity-25"}`}
      style={{ width: "40px", height: "40px" }}
    >
      <i className={`bi ${icon} text-white`}></i>
    </div>
    <p
      className={`small fw-bold mb-0 ${muted ? "opacity-25" : ""}`}
      style={{ fontSize: "0.65rem" }}
    >
      {label}
    </p>
    <p
      className={`small ${muted ? "opacity-25" : "text-muted"}`}
      style={{ fontSize: "0.6rem" }}
    >
      {status}
    </p>
  </div>
);

const OutreachTemplate = ({ title, body }) => (
  <div className="bg-dark bg-opacity-50 p-3 rounded mb-2 border border-white border-opacity-5">
    <div className="d-flex justify-content-between align-items-center mb-1">
      <span className="small fw-bold">{title}</span>
      <i className="bi bi-copy text-muted small cursor-pointer"></i>
    </div>
    <p
      className="text-muted mb-0 text-truncate italic small"
      style={{ fontSize: "0.7rem" }}
    >
      "{body}"
    </p>
  </div>
);

export default LearningLab;
