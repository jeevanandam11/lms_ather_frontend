import React from "react";
import "../../App.css";
const StatsRow = () => {
  return (
    <div className="row g-4 mb-5">
      <div className="col-md-4">
        <div className="glass-card p-4 d-flex align-items-center gap-4 h-100">
          <div className="progress-circle"></div>
          <div>
            <small
              className="text-light text-uppercase fw-bold"
              style={{ fontSize: "0.75rem" }}
            >
              Job Readiness
            </small>
            <p className="mb-0 mt-1">
              You're nearly there. Focus on{" "}
              <span className="fw-bold" style={{ color: "#00d29d" }}>
                System Design
              </span>{" "}
              to hit 85%.
            </p>
          </div>
        </div>
      </div>

      <div className="col-md-4">
        <div className="glass-card p-4 h-100">
          <small
            className="text-light text-uppercase fw-bold"
            style={{ fontSize: "0.75rem" }}
          >
            SYSTEM DESIGN COURSE
          </small>
          <div className="d-flex justify-content-between align-items-end my-2">
            <h5 className="mb-0">45% Complete</h5>
            <small className="text-light">12/26 Lessons</small>
          </div>
          <div className="progress bg-dark" style={{ height: "6px" }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: "45%", backgroundColor: "#8a70ff" }}
            ></div>
          </div>
          <button
            className="btn btn-sm mt-3 px-3 py-2 fw-bold"
            style={{
              backgroundColor: "rgba(138,112,255,0.15)",
              color: "#8a70ff",
              fontSize: "0.8rem",
            }}
          >
            Continue Topic
          </button>
        </div>
      </div>

      <div className="col-md-4">
        <div className="glass-card p-4 text-center h-100 d-flex flex-column justify-content-center">
          <div className="mb-2">
            <i
              className="bi bi-lightning-fill"
              style={{ color: "#8a70ff" }}
            ></i>
          </div>
          <small
            className="text-light text-uppercase fw-bold"
            style={{ fontSize: "0.75rem" }}
          >
            TARGET ROLE
          </small>
          <h5 className="mt-1 fw-bold">Senior Frontend Dev</h5>
          <div>
            <span
              className="badge bg-dark text-muted fw-normal p-2 mt-2"
              style={{
                fontSize: "0.7rem",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              Top 5% of candidates
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsRow;
