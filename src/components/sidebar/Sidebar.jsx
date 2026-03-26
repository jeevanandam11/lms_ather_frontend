import React from "react";
import "../../App.css";

const Sidebar = ({ onNavigate, activeView }) => {
  return (
    <div className="sidebar p-3 d-flex flex-column vh-100 sticky-top">
      <div className="mb-5 px-3 pt-3">
        <h4
          className="fw-bold text-uppercase mb-0"
          style={{ color: "#8a70ff", letterSpacing: "2px" }}
        >
          AETHER
        </h4>
        <small
          className="text-muted text-uppercase fw-semibold"
          style={{ fontSize: "0.7rem" }}
        >
          Learning Os
        </small>
      </div>

      <nav className="nav flex-column gap-2 flex-grow-1">
        <button
          onClick={() => onNavigate("home")}
          className={`nav-link border-0 bg-transparent text-start d-flex align-items-center gap-3 w-100 ${
            activeView === "home" ? "active" : ""
          }`}
        >
          <i className="bi bi-house-door"></i> Home
        </button>

        <button
          onClick={() => onNavigate("lab")}
          className={`nav-link border-0 bg-transparent text-start d-flex align-items-center gap-3 w-100 ${
            activeView === "lab" ? "active" : ""
          }`}
        >
          <i className="bi bi-flask"></i> Learning Lab
        </button>

        <button
          onClick={() => onNavigate("resume")}
          className={`nav-link border-0 bg-transparent text-start d-flex align-items-center gap-3 w-100 ${
            activeView === "resume" ? "active" : ""
          }`}
        >
          <i className="bi bi-file-person"></i> Resume Hub
        </button>
        <button
          onClick={() => onNavigate("placement")}
          className={`nav-link border-0 bg-transparent text-start d-flex align-items-center gap-3 w-100 ${
            activeView === "placement" ? "active" : ""
          }`}
        >
          <i className="bi bi-briefcase"></i> Placement Guide
        </button>
        <button
          onClick={() => onNavigate("library")}
          className={`nav-link border-0 bg-transparent text-start d-flex align-items-center gap-3 w-100 ${
            activeView === "library" ? "active" : ""
          }`}
        >
          <i className="bi bi-book"></i> Library
        </button>
      </nav>

      <div className="mt-auto p-3">
        <a href="#" className="nav-link d-flex align-items-center gap-3">
          <i className="bi bi-gear fs-5"></i> Settings
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
