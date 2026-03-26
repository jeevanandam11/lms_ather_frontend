import React from "react";

const Resume_Analyser = ({ onClick }) => {
  return (
    <>
      <div
        className="glass-card p-4 h-100 text-center d-flex flex-column justify-content-between"
        onClick={onClick}
        style={{
          cursor: "pointer",
          border: "2px dashed rgba(255,255,255,0.1)",
          background: "transparent",
        }}
      >
        <div className="d-flex align-items-center gap-3 mb-3 text-start">
          <div
            className="rounded-3 p-2 bg-dark d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
          >
            <i className="bi bi-file-earmark-text text-light"></i>
          </div>
          <h5 className="mb-0 text-uppercase fw-bold small tracking-wider">
            Analyze New Resume
          </h5>
        </div>
        <div className="py-4 border rounded-3 border-secondary border-opacity-10 mt-2 cursor-pointer">
          <i className="bi bi-upload d-block mb-2 text-light fs-4"></i>
          <p className="small text-light mb-0">Upload Resume (PDF, DOCX)</p>
        </div>
      </div>
    </>
  );
};

export default Resume_Analyser;
