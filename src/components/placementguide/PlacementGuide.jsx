import React, { useState } from "react";
// import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";
import "../../App.css";
import Resume_Analyser from "../resume_analyser/Resume_Analyser";
import ResumeHub from "../resumehub/ResumeHub";

const PlacementGuide = ({ isSidebarOpen, toggleSidebar }) => {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleRoleChange = (e) => setRole(e.target.value);

  const handleInitialize = async () => {
    if (!role) {
      setError("Please enter a target role.");
      return;
    }
    setError("");
    setLoading(true);
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    formData.append("targetRole", role);

    try {
      const response = await fetch(
        "http://localhost:8080/api/resume/placement-roadmap",
        {
          method: "POST",
          body: formData,
        },
      );
      if (!response.ok) throw new Error("Processing failed");
      const data = await response.json();
      setRoadmapData(data);
      localStorage.setItem("placementRoadmap", JSON.stringify(data));
      const historyItem = {
        id: Date.now(),
        targetRole: role,
        data: data,
        date: new Date().toLocaleDateString(),
      };
      const currentHistory = JSON.parse(
        localStorage.getItem("placementRoadmapHistory") || "[]",
      );
      localStorage.setItem(
        "placementRoadmapHistory",
        JSON.stringify([historyItem, ...currentHistory]),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const activeStep = 2;
  const roadmapSteps = [
    {
      title: "Profile Optimization",
      status: "Completed",
      icon: "bi-check-circle-fill",
      color: "text-success",
    },
    {
      title: "Skill Validation",
      status: "Verified",
      icon: "bi-shield-check",
      color: "text-success",
    },
    {
      title: "Interview Prep",
      status: "In Progress",
      icon: "bi-person-badge",
      color: "text-accent",
    },
    {
      title: "Active Applications",
      status: "Locked",
      icon: "bi-lock",
      color: "text-muted",
    },
  ];

  return (
    <>
      <div className="container-fluid p-0 overflow-hidden">
        <div className="row g-0">
          <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <main
            className={`${isSidebarOpen ? "col-md-12" : "col-md-12"} vh-100 overflow-auto p-4 p-lg-5 transition-all mar-top-space`}
          >
            {roadmapData && (
              <div className="glass-card p-5 mb-5 overflow-hidden position-relative">
                <h5 className="fw-bold mb-5">Placement Roadmap</h5>
                <div className="d-flex justify-content-between position-relative px-5">
                  <div className="roadmap-line-bg"></div>
                  <div
                    className="roadmap-line-fill"
                    style={{ width: "66%" }}
                  ></div>

                  {roadmapSteps.map((step, index) => (
                    <div
                      key={index}
                      className="text-center position-relative"
                      style={{ zIndex: 2 }}
                    >
                      <div
                        className={`roadmap-node mx-auto mb-3 d-flex align-items-center justify-content-center ${index <= activeStep ? "bg-accent shadow-glow" : "bg-dark"}`}
                      >
                        <i
                          className={`bi ${step.icon} fs-5 ${index <= activeStep ? "text-white" : "text-muted"}`}
                        ></i>
                      </div>
                      <p
                        className={`small fw-bold mb-0 ${index === activeStep ? "text-white" : "text-muted"}`}
                      >
                        {step.title}
                      </p>
                      <p className="text-muted" style={{ fontSize: "0.65rem" }}>
                        {step.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center mb-5">
              <h1 className="display-5 fw-bold mb-4">
                Let's Build Your Career Roadmap
              </h1>
            </div>

            <div className="row g-4 justify-content-center">
              {!roadmapData ? (
                <>
                  <div className="col-lg-10 mb-4">
                    <div
                      className="glass-card border-dashed p-5 text-center bg-opacity-10"
                      style={{ borderStyle: "dashed !important" }}
                    >
                      <div className="bg-orange-soft p-3 rounded-circle d-inline-block mb-3">
                        <i className="bi bi-file-earmark-arrow-up text-orange fs-3"></i>
                      </div>
                      <h4>Drop Your Current Resume Here</h4>
                      <p className="text-muted small">
                        Our AI will parse your skills to accelerate the journey.
                        (PDF, DOCX up to 10MB)
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        className="form-control bg-dark text-light border-secondary mt-3"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  <div className="col-lg-10">
                    <label className="text-orange text-uppercase fw-bold small mb-3 tracking-widest">
                      Enter Target Role
                    </label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary p-3"
                      placeholder="e.g. Frontend Developer, Data Scientist..."
                      value={role}
                      onChange={handleRoleChange}
                    />
                  </div>

                  {error && (
                    <div className="col-lg-10 mt-3">
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    </div>
                  )}

                  <div className="col-lg-10 text-center mt-5">
                    <button
                      className="btn btn-orange-lg w-100 py-3 fw-bold text-uppercase tracking-wider"
                      onClick={handleInitialize}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          Analyzing Resume{" "}
                          <span className="spinner-border spinner-border-sm ms-2"></span>
                        </>
                      ) : (
                        <>
                          Initialize My Journey{" "}
                          <i className="bi bi-rocket-takeoff-fill ms-2"></i>
                        </>
                      )}
                    </button>
                    <p
                      className="text-muted mt-3"
                      style={{ fontSize: "0.65rem" }}
                    >
                      By clicking initialize, you agree to our Terms of Deep
                      Learning Service
                    </p>
                  </div>
                </>
              ) : (
                <div className="col-lg-10 text-start">
                  <div className="glass-card p-4 mb-4 border border-success bg-success bg-opacity-10">
                    <h4 className="text-success">
                      <i className="bi bi-check-circle-fill me-2"></i> Roadmap
                      Generated Successfully!
                    </h4>
                    <p className="mb-1">
                      <strong>Skills Identified:</strong>{" "}
                      {roadmapData.skills_identified?.join(", ")}
                    </p>
                    <p className="mb-0 text-warning">
                      <strong>Skill Gaps:</strong>{" "}
                      {roadmapData.skill_gaps?.join(", ")}
                    </p>
                  </div>

                  {["beginner", "intermediate", "advanced"].map(
                    (level) =>
                      roadmapData.roadmap?.[level] &&
                      roadmapData.roadmap[level].length > 0 && (
                        <div key={level} className="mb-5">
                          <h4 className="text-orange text-uppercase fw-bold mb-3 border-bottom border-secondary pb-2">
                            {level} Phase
                          </h4>
                          <div className="row g-3">
                            {roadmapData.roadmap[level].map((topic, i) => (
                              <div className="col-md-6" key={i}>
                                <div
                                  className="glass-card p-4 h-100 text-center cursor-pointer transition-all hover-glow"
                                  onClick={() =>
                                    (window.location.href = `/?view=player&topic=${encodeURIComponent(topic)}`)
                                  }
                                  style={{
                                    cursor: "pointer",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                  }}
                                >
                                  <h5>{topic}</h5>
                                  <p className="small text-muted mb-0">
                                    Click to start AI Lesson
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                  )}

                  <button
                    className="btn btn-outline-light mt-4"
                    onClick={() => setRoadmapData(null)}
                  >
                    Start Over
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default PlacementGuide;
