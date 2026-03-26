import React, { useState } from "react";

const Topic_Gen = ({ onGenerate }) => {
  const [input, setInput] = useState("");

  const handleGenerate = () => {
    if (!input.trim()) {
      alert("Enter a topic");
      return;
    }
    onGenerate(input);
  };

  return (
    <div
      className="glass-card p-4"
      style={{ borderLeft: "4px solid var(--accent-purple)" }}
    >
      <div className="d-flex align-items-center gap-3 mb-3">
        <div
          className="rounded-3 p-2 text-white d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "var(--accent-purple)",
            width: "40px",
            height: "40px",
          }}
        >
          <i className="bi bi-plus-lg fw-bold"></i>
        </div>
        <h5 className="mb-0 text-uppercase fw-bold small">
          Generate New Topic
        </h5>
      </div>

      <p className="text-light small">
        Our AI architect will build a custom learning path, videos, and labs for
        any concept instantly.
      </p>

      <div className="input-group mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="form-control bg-dark border-0 text-white p-3 shadow-none"
          placeholder="e.g., GraphQL Basics"
          style={{ borderRadius: "10px 0 0 10px" }}
        />

        <button
          onClick={handleGenerate}
          className="btn px-4 fw-bold"
          style={{
            backgroundColor: "var(--accent-purple)",
            color: "white",
            borderRadius: "0 10px 10px 0",
          }}
        >
          Generate
        </button>
      </div>
    </div>
  );
};

export default Topic_Gen;
