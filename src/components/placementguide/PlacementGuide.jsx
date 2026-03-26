import React from "react";
// import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";
import "../../App.css";
import Resume_Analyser from "../resume_analyser/Resume_Analyser";
import ResumeHub from "../resumehub/ResumeHub";

const PlacementGuide = ({ isSidebarOpen, toggleSidebar }) => {
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
          {/* Sidebar Column */}
          {/* <div
          className={`p-0 transition-all ${isSidebarOpen ? "col-md-2" : "d-none"}`}
          style={{ transition: "0.3s ease" }}
        >
          <Sidebar />
        </div> */}

          {/* Main Content Column */}
          <main
            className={`${isSidebarOpen ? "col-md-10" : "col-md-12"} vh-100 overflow-auto p-4 p-lg-5 transition-all`}
          >
            <Header
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
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

            <div className="text-center mb-5">
              <h1 className="display-5 fw-bold mb-4">
                Let's Build Your Career Roadmap
              </h1>
            </div>

            <div className="row g-4 justify-content-center">
              {/* <div className="col-lg-10 mb-4">
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
                  <button className="btn btn-outline-light border-opacity-25 px-4 mt-2">
                    Browse Files
                  </button>
                  <button className="btn btn-link d-block mx-auto mt-3 text-muted text-decoration-none small">
                    Skip for now
                  </button>
                </div>
              </div> */}
              <Resume_Analyser />

              {/* Role Selection */}
              <div className="col-lg-10">
                <label className="text-orange text-uppercase fw-bold small mb-3 tracking-widest">
                  Select Target Role
                </label>
                <div className="row g-3">
                  {/* <RoleCard
                    icon="bi-terminal"
                    title="Frontend Developer"
                    desc="Master React, Tailwind, and UI/UX architecture."
                  />
                  <RoleCard
                    icon="bi-database"
                    title="Data Scientist"
                    desc="Deep dive into ML, Python, and neural logic."
                    active
                  />
                  <RoleCard
                    icon="bi-layer-forward"
                    title="Product Manager"
                    desc="Agile workflows, strategy, and user growth."
                  /> */}
                </div>
              </div>

              {/* Final Action */}
              <div className="col-lg-10 text-center mt-5">
                <button className="btn btn-orange-lg w-100 py-3 fw-bold text-uppercase tracking-wider">
                  Initialize My Journey{" "}
                  <i className="bi bi-rocket-takeoff-fill ms-2"></i>
                </button>
                <p className="text-muted mt-3" style={{ fontSize: "0.65rem" }}>
                  By clicking initialize, you agree to our Terms of Deep
                  Learning Service
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default PlacementGuide;
