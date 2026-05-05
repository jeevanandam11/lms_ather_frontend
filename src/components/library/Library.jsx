import React, { useState, useEffect } from "react";
import axios from "axios";
// import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";
import "../../App.css";

const Library = ({ isSidebarOpen, toggleSidebar }) => {
  const [history, setHistory] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const res = await axios.get(
            `http://localhost:8080/api/history/user/${user.id}`,
          );
          setHistory(res.data);
        }
      } catch (err) {
        console.error("Error fetching history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/history/${id}`);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Error deleting history", err);
    }
  };

  return (
    <>
      <div className="container-fluid p-0 overflow-hidden">
        <div className="row g-0">
          {/* Header */}
          <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          {/* Sidebar Column */}
          {/* <div
          className={`p-0 transition-all ${isSidebarOpen ? "col-md-2" : "d-none"}`}
          style={{ transition: "0.3s ease" }}
        >
          <Sidebar />
        </div> */}
          {/* Main Content Column */}
          <main
            className={`${isSidebarOpen ? "col-md-12" : "col-md-12"} vh-100 overflow-auto p-4 p-lg-5 transition-all mar-top-space`}
          >
            <div className="row g-4">
              <div className="col-lg-12">
                {/* <h6 className="text-uppercase fw-bold small mb-4 opacity-50 tracking-widest">
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
                </div> */}

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="text-uppercase fw-bold small mb-0 opacity-50 tracking-widest">
                    Knowledge Archive
                  </h6>
                  <div className="btn-group">
                    <button
                      className={`btn btn-sm btn-dark border-0 ${viewMode === "grid" ? "" : "opacity-50"}`}
                      onClick={() => setViewMode("grid")}
                    >
                      <i className="bi bi-grid-fill"></i>
                    </button>
                    <button
                      className={`btn btn-sm btn-dark border-0 ${viewMode === "list" ? "" : "opacity-50"}`}
                      onClick={() => setViewMode("list")}
                    >
                      <i className="bi bi-list"></i>
                    </button>
                  </div>
                </div>

                {loading ? (
                  <p className="text-muted">Loading history...</p>
                ) : history.length === 0 ? (
                  <p className="text-muted">
                    No generated topics found. Use the Topic Generator to get
                    started!
                  </p>
                ) : viewMode === "grid" ? (
                  <div className="row g-4">
                    {history.map((item) => (
                      <div key={item.id} className="col-md-4">
                        <div className="glass-card p-4 h-100 d-flex flex-column card-hover">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div
                              className="bg-dark rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: "40px", height: "40px" }}
                            >
                              <i className="bi bi-journal-text text-accent fs-5"></i>
                            </div>
                            <button
                              className="btn btn-link text-danger p-0"
                              onClick={() => handleDelete(item.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>

                          <h6
                            className="fw-bold mb-2 text-truncate"
                            title={item.topicName}
                          >
                            {item.topicName}
                          </h6>
                          <p className="small text-light mb-4 flex-grow-1">
                            Generated:{" "}
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>

                          <div className="mt-auto">
                            {item.pdfBase64 ? (
                              <a
                                href={`data:application/pdf;base64,${item.pdfBase64}`}
                                download={`${item.topicName}.pdf`}
                                className="btn btn-sm btn-outline-purple w-100 fw-bold"
                                style={{ fontSize: "0.8rem" }}
                              >
                                <i className="bi bi-file-pdf  me-2"></i> Extract
                                PDF
                              </a>
                            ) : (
                              <button
                                disabled
                                className="btn btn-sm btn-outline-secondary w-100 fw-bold"
                                style={{ fontSize: "0.8rem" }}
                              >
                                No PDF
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="table-responsive glass-card p-0">
                    <table
                      className="table table-dark table-hover mb-0"
                      style={{ backgroundColor: "transparent" }}
                    >
                      <thead>
                        <tr>
                          <th className="bg-transparent border-bottom border-secondary text-light small fw-normal py-3 ps-4">
                            TOPIC NAME
                          </th>
                          <th className="bg-transparent border-bottom border-secondary text-light small fw-normal py-3">
                            DATE
                          </th>
                          <th className="bg-transparent border-bottom border-secondary text-muted small fw-normal py-3 text-end pe-4">
                            ACTIONS
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((item) => (
                          <tr key={item.id}>
                            <td className="bg-transparent border-bottom border-secondary border-opacity-25 align-middle py-3 ps-4">
                              <span className="fw-bold">{item.topicName}</span>
                            </td>
                            <td className="bg-transparent border-bottom border-secondary border-opacity-25 align-middle py-3 text-light small">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </td>
                            <td className="bg-transparent border-bottom border-secondary border-opacity-25 align-middle py-3 text-end pe-4">
                              {item.pdfBase64 && (
                                <a
                                  href={`data:application/pdf;base64,${item.pdfBase64}`}
                                  download={`${item.topicName}.pdf`}
                                  className="btn btn-sm btn-outline-purple me-2"
                                >
                                  <i className="bi bi-file-pdf"></i>
                                </a>
                              )}
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(item.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
