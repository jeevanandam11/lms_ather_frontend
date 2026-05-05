import React, { useState } from "react";
import Compiler from "../compilerComp/CompilerComp";
import WebEditor from "./WebEditor";
import AptitudeWorkspace from "./AptitudeWorkspace";
import DSAVisualizer from "./DSAVisualizer";

const WorkspacePanel = ({ isFullscreen, setIsFullscreen, topic }) => {
  const [activeTab, setActiveTab] = useState("programming");

  const tabs = [
    { id: "programming", label: "Programming", icon: "bi-code-slash" },
    { id: "web", label: "Web Editor", icon: "bi-browser-chrome" },
    { id: "aptitude", label: "Aptitude", icon: "bi-calculator" },
    { id: "dsa", label: "DSA Visualizer", icon: "bi-diagram-3" },
  ];

  return (
    <div className="d-flex flex-column h-100" style={{ backgroundColor: "#0f111a" }}>
      {/* Workspace Header / Tabs */}
      <div 
        className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="d-flex gap-2 overflow-auto" style={{ scrollbarWidth: "none" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 ${
                activeTab === tab.id
                  ? "btn-accent text-white fw-bold shadow-sm"
                  : "btn-outline-secondary text-light border-0"
              }`}
              style={{
                borderRadius: "8px",
                transition: "all 0.3s ease",
                backgroundColor: activeTab === tab.id ? "var(--accent-color, #6366f1)" : "transparent",
                opacity: activeTab === tab.id ? 1 : 0.7,
              }}
            >
              <i className={`bi ${tab.icon}`}></i>
              <span className="d-none d-md-inline">{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="btn btn-sm btn-outline-light d-flex align-items-center justify-content-center"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          style={{ width: "36px", height: "36px", borderRadius: "8px" }}
        >
          <i className={`bi ${isFullscreen ? "bi-fullscreen-exit" : "bi-arrows-fullscreen"}`}></i>
        </button>
      </div>

      {/* Dynamic Content Area */}
      <div className="flex-grow-1 overflow-hidden position-relative">
        {activeTab === "programming" && <Compiler />}
        {activeTab === "web" && <WebEditor />}
        {activeTab === "aptitude" && <AptitudeWorkspace topic={topic} />}
        {activeTab === "dsa" && <DSAVisualizer topic={topic} />}
      </div>
    </div>
  );
};

export default WorkspacePanel;
