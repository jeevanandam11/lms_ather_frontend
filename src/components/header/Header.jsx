import React, { useState, useEffect } from "react";
import "../../App.css";

const Header = ({ isSidebarOpen, toggleSidebar }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  return (
    <>
      <header className="d-flex justify-content-between align-items-center mb-5">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-dark border-0 shadow-none d-flex align-items-center justify-content-center"
            onClick={() => {
              toggleSidebar();
            }}
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              width: "40px",
              height: "40px",
            }}
          >
            <i
              className={`bi ${isSidebarOpen ? "bi-text-indent-right" : "bi-list"} fs-4`}
            ></i>
          </button>

          <div>
            <h2 className="fw-bold mb-0 fs-4">Welcome back, {user ? (user.firstName || user.email.split('@')[0]) : "Guest"}</h2>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input
              type="text"
              className="form-control bg-dark border-0 text-white ps-5 shadow-none"
              placeholder="Search knowledge base..."
              style={{ width: "300px", borderRadius: "10px" }}
            />
          </div>
          <div className="position-relative px-2">
            <i className="bi bi-bell fs-5 text-muted"></i>
            <span
              className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
              style={{ width: "8px", height: "8px" }}
            ></span>
          </div>
          <div
            className="rounded-circle bg-secondary"
            onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "profile" }))}
            style={{
              width: "40px",
              height: "40px",
              cursor: "pointer",
              background: "linear-gradient(45deg, #2d334a, #1a1d2b)",
            }}
          ></div>
        </div>
      </header>
    </>
  );
};

export default Header;
