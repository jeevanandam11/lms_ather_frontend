import React, { useState, useEffect } from "react";
import axios from "axios";
import StatsRow from "../statsrow/StatsRow";
import Header from "../header/Header";
import "../../App.css";
import Topic_Gen from "../topic_gen/Topic_Gen";
import Resume_Analyser from "../resume_analyser/Resume_Analyser";

const Dashboard = ({ isSidebarOpen, toggleSidebar, onNavigate }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const res = await axios.get(
            `http://localhost:8080/api/history/user/${user.id}`,
          );
          const sorted = res.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
          setHistory(sorted.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching history", err);
      }
    };
    fetchHistory();
  }, []);

  const handleGenerate = (newTopic) => {
    const existingItem = history.find(h => h.topicName.toLowerCase() === newTopic.trim().toLowerCase());
    if (existingItem) {
      window.dispatchEvent(
        new CustomEvent("navigate", {
          detail: { view: "player", historyId: existingItem.id, topic: existingItem.topicName },
        }),
      );
      window.history.pushState(null, "", "?view=player&historyId=" + existingItem.id + "&topic=" + encodeURIComponent(existingItem.topicName));
    } else {
      window.dispatchEvent(
        new CustomEvent("navigate", {
          detail: { view: "player", topic: newTopic },
        }),
      );
      window.history.pushState(null, "", "?view=player&topic=" + encodeURIComponent(newTopic));
    }
  };

  const handleNoteClick = (item) => {
    window.dispatchEvent(
      new CustomEvent("navigate", {
        detail: { view: "player", historyId: item.id, topic: item.topicName },
      }),
    );
    window.history.pushState(
      null,
      "",
      "?view=player&historyId=" + item.id + "&topic=" + encodeURIComponent(item.topicName),
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
            className={`${
              isSidebarOpen ? "col-md-12" : "col-md-12"
            } vh-100 overflow-auto p-4 p-lg-5 transition-all mar-top-space`}
          >
            <div className="row g-4 mb-5">
              <div className="col-md-7">
                <Topic_Gen onGenerate={handleGenerate} />
              </div>

              <div className="col-md-5">
                <Resume_Analyser
                  onClick={() => onNavigate && onNavigate("resume")}
                />
              </div>
            </div>

            <section className="mt-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6
                  className="text-uppercase fw-bold m-0 opacity-75"
                  style={{ letterSpacing: "1.5px", fontSize: "0.8rem" }}
                >
                  Latest Generated Topic
                </h6>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigate) onNavigate("library");
                  }}
                  className="text-decoration-none text-light small"
                >
                  View All History
                </a>
              </div>

              <div className="row g-4">
                {history.map((item, index) => (
                  <div key={item.id || index} className="col-md-3">
                    <div 
                      className={`glass-card p-0 overflow-hidden h-100 card-hover ${index === 0 ? 'border border-accent shadow-accent' : ''}`}
                      onClick={() => handleNoteClick(item)}
                      style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                    >
                      <div
                        className="bg-dark d-flex align-items-center justify-content-center position-relative"
                        style={{ height: "140px" }}
                      >
                        {index === 0 && (
                          <span className="position-absolute top-0 end-0 badge bg-accent m-2" style={{ fontSize: "0.6rem" }}>LATEST</span>
                        )}
                        <i
                          className={`bi bi-${item.pdfBase64 ? "file-pdf" : "journal-text"} fs-1 opacity-25`}
                        ></i>
                      </div>

                      <div className="p-3">
                        <h6
                          className="fw-bold small text-truncate"
                          title={item.topicName}
                        >
                          {item.topicName}
                        </h6>

                        <span className="badge bg-primary bg-opacity-10 text-primary mb-2">
                          AI CURATED
                        </span>

                        <p className="text-light small">
                          Generated:{" "}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {history.length === 0 && (
                  <div className="col-12">
                    <div
                      className="glass-card h-100 d-flex flex-column align-items-center justify-content-center p-4 text-light opacity-50"
                      style={{
                        border: "2px dashed rgba(255,255,255,0.1)",
                        minHeight: "230px",
                      }}
                    >
                      <i className="bi bi-info-circle fs-3 mb-2"></i>
                      <span className="small fw-bold">
                        No generated topics found
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
