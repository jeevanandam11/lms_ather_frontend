import React, { useState, useEffect } from "react";
import Header from "../header/Header";
import "../../App.css";

const MyCertificate = ({ isSidebarOpen, toggleSidebar }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) throw new Error("No active user session.");
        
        const response = await fetch(`http://localhost:8080/api/certificates/user/${user.id}`);
        if (!response.ok) throw new Error("Failed to load certificates.");
        
        const data = await response.json();
        setCertificates(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  return (
    <div className="container-fluid p-0 overflow-hidden">
      <div className="row g-0">
        <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main
          className={`${isSidebarOpen ? "col-md-12" : "col-md-12"} vh-100 overflow-auto p-4 p-lg-5 transition-all`}
        >
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold mb-4">My Dashboard Certificates</h1>
            <p className="text-muted">Review and display your completed digital achievements.</p>
          </div>

          <div className="row g-4 justify-content-center">
            {loading ? (
              <div className="text-center">
                <span className="spinner-border text-accent"></span>
              </div>
            ) : error ? (
              <div className="alert alert-danger w-50">{error}</div>
            ) : certificates.length === 0 ? (
              <div className="col-lg-8 animate-fade-in text-center mt-5">
                <div className="glass-card p-5 border border-secondary border-opacity-25">
                  <i className="bi bi-award display-1 text-muted mb-3 opacity-25"></i>
                  <h4>No Certificates Found</h4>
                  <p className="text-muted small">Pass a Mock AI Simulator Placement Quiz to automatically generate achievements!</p>
                  <button className="btn btn-outline-accent mt-3" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "quiz" }))}>Take A Quiz</button>
                </div>
              </div>
            ) : (
              certificates.map((cert) => (
                <div key={cert.id} className="col-lg-10 mb-4 animate-fade-in">
                  <div className="glass-card p-4 text-center">
                    <div className="d-flex justify-content-between align-items-center mb-3 px-3">
                      <h5 className="mb-0 fw-bold">{cert.courseName}</h5>
                      <span className="badge bg-accent bg-opacity-25 text-accent border border-accent border-opacity-50">Issued: {cert.issueDate}</span>
                    </div>
                    <img 
                      src={cert.imageBase64} 
                      alt="Certificate of Achievement" 
                      className="img-fluid rounded shadow-glow" 
                      style={{ maxHeight: "700px", border: "1px solid rgba(255,255,255,0.1)" }} 
                    />
                    <div className="mt-4">
                      <a href={cert.imageBase64} download={`Certificate_${cert.id}.png`} className="btn btn-accent px-4 py-2 fw-bold">
                        <i className="bi bi-download me-2"></i> Download Image
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyCertificate;
