import React, { useState } from "react";
import StatsRow from "../statsrow/StatsRow";
import Header from "../header/Header";
import "../../App.css";
import Topic_Gen from "../topic_gen/Topic_Gen";
import Resume_Analyser from "../resume_analyser/Resume_Analyser";

const Dashboard = ({ isSidebarOpen, toggleSidebar, onNavigate }) => {
  const handleGenerate = (newTopic) => {
    window.open("?view=player&topic=" + encodeURIComponent(newTopic), "_blank");
  };

  return (
    <>
      <div className="container-fluid p-0 overflow-hidden">
        <div className="row g-0">
          <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          {/* Main Content */}
          <main
            className={`${
              isSidebarOpen ? "col-md-12" : "col-md-12"
            } vh-100 overflow-auto p-4 p-lg-5 transition-all`}
          >
            {/* Header */}

            {/* Stats */}
            <StatsRow />

            {/* 🔥 Action Section */}
            <div className="row g-4 mb-5">
              {/* LEFT SIDE */}
              <div className="col-md-7">
                <Topic_Gen onGenerate={handleGenerate} />
              </div>

              {/* RIGHT SIDE */}
              <div className="col-md-5">
                <Resume_Analyser
                  onClick={() => onNavigate && onNavigate("resume")}
                />
              </div>
            </div>

            {/* 📚 Recently Generated */}
            <section className="mt-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6
                  className="text-uppercase fw-bold m-0 opacity-75"
                  style={{ letterSpacing: "1.5px", fontSize: "0.8rem" }}
                >
                  Recently Generated Content
                </h6>

                <a href="#" className="text-decoration-none text-light small">
                  View All History
                </a>
              </div>

              <div className="row g-4">
                {/* Card 1 */}
                <div className="col-md-3">
                  <div className="glass-card p-0 overflow-hidden h-100">
                    <div
                      className="bg-dark d-flex align-items-center justify-content-center position-relative"
                      style={{ height: "140px" }}
                    >
                      <i className="bi bi-play-circle fs-1 opacity-25"></i>
                      <span className="position-absolute bottom-0 end-0 m-2 badge bg-black">
                        14:20
                      </span>
                    </div>

                    <div className="p-3">
                      <h6 className="fw-bold small">Intro to Docker - Video</h6>

                      <span className="badge bg-primary bg-opacity-10 text-primary mb-2">
                        AI CURATED
                      </span>

                      <p className="text-light small">
                        Includes containers vs images breakdown & workflow...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="col-md-3">
                  <div className="glass-card p-0 overflow-hidden h-100">
                    <div
                      className="bg-dark d-flex align-items-center justify-content-center"
                      style={{ height: "140px" }}
                    >
                      <i className="bi bi-file-earmark-code fs-1 opacity-25"></i>
                    </div>

                    <div className="p-3">
                      <h6 className="fw-bold small">React Hooks Deep Dive</h6>

                      <span className="badge bg-info bg-opacity-10 text-info mb-2">
                        RESOURCE
                      </span>

                      <p className="text-light small">
                        Cheatsheet on useEffect, useMemo, custom hooks...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="col-md-3">
                  <div className="glass-card p-0 overflow-hidden h-100">
                    <div
                      className="bg-dark d-flex align-items-center justify-content-center"
                      style={{ height: "140px" }}
                    >
                      <i className="bi bi-database fs-1 opacity-25"></i>
                    </div>

                    <div className="p-3">
                      <h6 className="fw-bold small">Advanced SQL Queries</h6>

                      <span className="badge bg-success bg-opacity-10 text-success mb-2">
                        COMPLETE
                      </span>

                      <p className="text-light small">
                        Complex joins & window functions optimized...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add New */}
                <div className="col-md-3">
                  <div
                    className="glass-card h-100 d-flex flex-column align-items-center justify-content-center p-4 text-light opacity-50"
                    style={{
                      border: "2px dashed rgba(255,255,255,0.1)",
                      minHeight: "230px",
                    }}
                  >
                    <i className="bi bi-plus-circle fs-3 mb-2"></i>
                    <span className="small fw-bold">Add New Snippet</span>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
