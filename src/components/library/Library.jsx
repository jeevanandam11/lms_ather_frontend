import React from "react";
// import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";
import "../../App.css";

const Library = ({ isSidebarOpen, toggleSidebar }) => {
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
            {/* Header */}
            <Header
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
            <div className="row g-4">
              <div className="col-lg-8">
                <h6 className="text-uppercase fw-bold small mb-4 opacity-50 tracking-widest">
                  Current Learning Paths
                </h6>
                <div className="row g-4 mb-5">
                  <PathProgressCard
                    title="Backend Engineering"
                    progress={75}
                    modules="12/16"
                    tags={["#Python", "#SystemDesign"]}
                  />
                  <PathProgressCard
                    title="Frontend Mastery"
                    progress={40}
                    modules="4/10"
                    tags={["#React", "#Tailwind"]}
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="text-uppercase fw-bold small mb-0 opacity-50 tracking-widest">
                    Knowledge Archive
                  </h6>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-dark border-0">
                      <i className="bi bi-grid-fill"></i>
                    </button>
                    <button className="btn btn-sm btn-dark border-0 opacity-50">
                      <i className="bi bi-list"></i>
                    </button>
                  </div>
                </div>

                <div className="row g-4">
                  <ArchiveCard
                    type="video"
                    title="Advanced React Patterns"
                    duration="12:45 mins"
                    tags={["#JavaScript", "#WebDev"]}
                    isNew
                  />
                  <ArchiveCard
                    type="pdf"
                    title="System Design: Scalability"
                    size="2.4 MB"
                    tags={["#InterviewPrep", "#Architecture"]}
                  />
                  <ArchiveCard
                    type="note"
                    title="Personal SQL Cheat Sheet"
                    modified="Modified 2h ago"
                    tags={["#SQL", "#Database"]}
                  />
                </div>
              </div>

              <div className="col-lg-4">
                <div className="glass-card h-100 p-0 overflow-hidden d-flex flex-column">
                  <div className="p-4 border-bottom border-white border-opacity-10 d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0">
                      <i className="bi bi-cpu-fill text-accent me-2"></i>Global
                      AI Notes
                    </h6>
                    <i className="bi bi-plus-circle text-muted"></i>
                  </div>
                  <div className="p-4 flex-grow-1 overflow-auto">
                    <AINoteItem
                      topic="REACT OPTIMIZATION"
                      time="14:02"
                      content="Remember to use useMemo for heavy computations. AI suggested checking the reconciler logic..."
                    />
                    <AINoteItem
                      topic="SQL JOINS"
                      time="Yesterday"
                      content="Left join vs Inner join performance impact on table with 5M records. ai_insight: Add indexes to join keys..."
                    />
                    <AINoteItem
                      topic="API DESIGN"
                      time="Aug 12"
                      content="RESTful principles for the new microservice architecture. Avoid nested resources more than 2 levels deep..."
                    />
                  </div>
                  <div className="p-4 mt-auto border-top border-white border-opacity-10 bg-dark bg-opacity-25">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="spinner-grow spinner-grow-sm text-accent"
                        role="status"
                      ></div>
                      <div>
                        <p className="small fw-bold mb-0">Smart Sync Active</p>
                        <p
                          className="text-muted mb-0"
                          style={{ fontSize: "0.65rem" }}
                        >
                          Last updated: 2 mins ago
                        </p>
                      </div>
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

const PathProgressCard = ({ title, progress, modules, tags }) => (
  <div className="col-md-6">
    <div className="glass-card p-4 d-flex align-items-center gap-4">
      <div
        className="progress-circle-sm"
        style={{
          background: `conic-gradient(var(--accent-purple) ${progress}%, #2d334a 0)`,
        }}
      >
        <span className="fw-bold small">{progress}%</span>
      </div>
      <div>
        <h6 className="fw-bold mb-1">{title}</h6>
        <p className="text-muted small mb-2">{modules} modules completed</p>
        <div className="d-flex gap-2">
          {tags.map((t) => (
            <span key={t} className="text-muted" style={{ fontSize: "0.7rem" }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ArchiveCard = ({
  type,
  title,
  duration,
  size,
  modified,
  tags,
  isNew,
}) => (
  <div className="col-md-4">
    <div className="glass-card p-0 overflow-hidden h-100 card-hover">
      <div
        className="archive-thumb d-flex align-items-center justify-content-center bg-black position-relative"
        style={{ height: "160px" }}
      >
        {isNew && (
          <span className="badge bg-accent position-absolute top-0 end-0 m-3">
            NEW
          </span>
        )}
        <i
          className={`bi ${type === "video" ? "bi-play-circle-fill" : type === "pdf" ? "bi-file-earmark-text" : "bi-pencil-square"} display-5 opacity-50`}
        ></i>
      </div>
      <div className="p-3">
        <p className="text-muted mb-2" style={{ fontSize: "0.7rem" }}>
          <i
            className={`bi ${type === "video" ? "bi-camera-video" : "bi-file-earmark"} me-2`}
          ></i>
          {duration || size || modified}
        </p>
        <h6 className="fw-bold text-truncate">{title}</h6>
        <div className="d-flex gap-2 mt-2">
          {tags.map((t) => (
            <span
              key={t}
              className="badge bg-dark border border-white border-opacity-10 fw-normal"
              style={{ fontSize: "0.6rem" }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AINoteItem = ({ topic, time, content }) => (
  <div className="mb-4">
    <div className="d-flex justify-content-between align-items-center mb-2">
      <span className="text-accent fw-bold small tracking-widest">{topic}</span>
      <span className="text-muted small" style={{ fontSize: "0.65rem" }}>
        {time}
      </span>
    </div>
    <p className="text-muted small mb-0 lh-base">{content}</p>
  </div>
);
export default Library;
