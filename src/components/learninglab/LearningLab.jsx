import React from "react";
import "../../App.css";
import Header from "../header/Header";

const LearningLab = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <>
      <div className="container-fluid p-0 overflow-hidden">
        <div className="row g-0">
          {/* Main Content */}
          <main
            className={`${isSidebarOpen ? "col-md-10" : "col-md-12"} vh-100 overflow-auto p-4 p-lg-5 transition-all`}
          >
            {/* Header */}
            <Header
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
            <div className="p-4 p-lg-5">
              <header className="d-flex justify-content-between align-items-center mb-5">
                <div className="d-flex align-items-center gap-3">
                  <button
                    className="btn btn-dark border-0 rounded-3 p-2"
                    onClick={toggleSidebar}
                  >
                    <i
                      className={`bi ${isSidebarOpen ? "bi-text-indent-left" : "bi-list"} fs-5 text-muted`}
                    ></i>
                  </button>
                  <div>
                    <h2 className="fw-bold mb-0">Tactical Placement Suite</h2>
                    <p className="text-muted mb-0 small">
                      Phase 3: Interview Prep (Active)
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="position-relative">
                    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                    <input
                      className="form-control bg-dark border-0 text-white ps-5"
                      placeholder="Search roles, companies..."
                      style={{ width: "350px" }}
                    />
                  </div>
                  <i className="bi bi-bell fs-5 text-muted px-2"></i>
                  <div
                    className="rounded-circle bg-secondary"
                    style={{ width: "40px", height: "40px" }}
                  ></div>
                </div>
              </header>

              <div className="row g-4">
                <div className="col-lg-8">
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

                  <div className="glass-card p-4 mb-4">
                    <h6 className="text-uppercase fw-bold small mb-4 opacity-50">
                      Placement Roadmap
                    </h6>
                    <div className="d-flex justify-content-between position-relative px-5">
                      <div className="roadmap-line"></div>
                      <RoadmapStep
                        icon="bi-check-lg"
                        label="Profile Optimization"
                        status="Completed"
                        active
                      />
                      <RoadmapStep
                        icon="bi-check-lg"
                        label="Skill Validation"
                        status="Verified"
                        active
                      />
                      <RoadmapStep
                        icon="bi-people"
                        label="Interview Prep"
                        status="In Progress"
                        highlight
                      />
                      <RoadmapStep
                        icon="bi-send"
                        label="Active Applications"
                        status="Locked"
                        muted
                      />
                    </div>
                  </div>

                  <div className="glass-card overflow-hidden">
                    <div className="p-3 border-bottom border-white border-opacity-10 d-flex justify-content-between align-items-center">
                      <span className="small fw-bold">
                        <i className="bi bi-camera-video me-2"></i>Mock
                        Interview Simulator
                      </span>
                      <div className="d-flex align-items-center gap-3">
                        <span className="text-danger small">
                          <i
                            className="bi bi-circle-fill me-2"
                            style={{ fontSize: "0.5rem" }}
                          ></i>
                          REC 04:12
                        </span>
                        <button className="btn btn-sm btn-outline-light border-opacity-25">
                          End Session
                        </button>
                      </div>
                    </div>
                    <div className="row g-0" style={{ minHeight: "350px" }}>
                      <div className="col-md-7 bg-black d-flex align-items-center justify-content-center border-end border-white border-opacity-10">
                        <i className="bi bi-person-circle display-1 opacity-25"></i>
                      </div>
                      <div className="col-md-5 p-3 bg-dark bg-opacity-25">
                        <label className="text-muted small mb-3 text-uppercase">
                          Live Transcription
                        </label>
                        <div className="small mb-4">
                          <p className="mb-2">
                            <span className="text-accent fw-bold">
                              Aether AI:
                            </span>{" "}
                            "How would you optimize a high-traffic API
                            endpoint?"
                          </p>
                          <p className="text-muted">
                            <span className="text-success fw-bold">You:</span>{" "}
                            "I would implement a write-through cache
                            strategy..."
                          </p>
                        </div>
                        <div className="p-3 rounded bg-accent bg-opacity-10 border border-accent border-opacity-20">
                          <p className="small mb-0 text-accent">
                            <i className="bi bi-stars me-2"></i>REAL-TIME
                            INSIGHT
                          </p>
                          <p className="small text-muted mb-0">
                            Try to emphasize horizontal scaling in your
                            response.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4">
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
                </div>
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
