import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

const WebEditor = () => {
  const [activeTab, setActiveTab] = useState("html");
  const [html, setHtml] = useState("<h1>Hello World</h1>\n<p>Start building your AI-enhanced UI here.</p>");
  const [css, setCss] = useState("body {\n  font-family: sans-serif;\n  background-color: #f0f0f0;\n  color: #333;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n}\n\nh1 {\n  color: #6366f1;\n}");
  const [js, setJs] = useState("console.log('Web Editor Initialized');");
  const [srcDoc, setSrcDoc] = useState("");
  const [devicePreview, setDevicePreview] = useState("desktop");

  const handleRun = () => {
    setSrcDoc(`
      <html>
        <body>${html}</body>
        <style>${css}</style>
        <script>${js}</script>
      </html>
    `);
  };

  useEffect(() => {
    handleRun();
    // eslint-disable-next-line
  }, []);

  const getDeviceWidth = () => {
    switch (devicePreview) {
      case "mobile": return "375px";
      case "tablet": return "768px";
      default: return "100%";
    }
  };

  return (
    <div className="d-flex flex-column h-100 bg-dark text-white">
      {/* Web Editor Toolbar */}
      <div className="d-flex justify-content-between align-items-center p-2 border-bottom border-secondary border-opacity-25 bg-black bg-opacity-25">
        <div className="d-flex gap-2">
          {["html", "css", "js"].map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              className={`btn btn-sm text-uppercase fw-bold ${
                activeTab === lang ? "btn-accent" : "btn-outline-secondary text-light border-0"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        <div className="d-flex gap-2 align-items-center">
          <button className="btn btn-sm btn-success fw-bold d-flex align-items-center gap-1 me-2 shadow-sm" onClick={handleRun}>
            <i className="bi bi-play-fill fs-6"></i> Run
          </button>
          <div className="btn-group border border-secondary border-opacity-25 rounded">
            <button 
              className={`btn btn-sm ${devicePreview === 'mobile' ? 'btn-secondary' : 'btn-dark'}`}
              onClick={() => setDevicePreview('mobile')}
              title="Mobile"
            ><i className="bi bi-phone"></i></button>
            <button 
              className={`btn btn-sm ${devicePreview === 'tablet' ? 'btn-secondary' : 'btn-dark'}`}
              onClick={() => setDevicePreview('tablet')}
              title="Tablet"
            ><i className="bi bi-tablet"></i></button>
            <button 
              className={`btn btn-sm ${devicePreview === 'desktop' ? 'btn-secondary' : 'btn-dark'}`}
              onClick={() => setDevicePreview('desktop')}
              title="Desktop"
            ><i className="bi bi-display"></i></button>
          </div>
          <div className="dropdown">
            <button className="btn btn-sm btn-outline-info dropdown-toggle d-flex align-items-center gap-1" data-bs-toggle="dropdown">
              <i className="bi bi-magic"></i> AI Enhance
            </button>
            <ul className="dropdown-menu dropdown-menu-dark">
              <li><button className="dropdown-item"><i className="bi bi-palette me-2"></i>Improve UI</button></li>
              <li><button className="dropdown-item"><i className="bi bi-phone me-2"></i>Make Responsive</button></li>
              <li><button className="dropdown-item"><i className="bi bi-film me-2"></i>Add Animation</button></li>
              <li><button className="dropdown-item"><i className="bi bi-wind me-2"></i>Convert to Tailwind</button></li>
              <li><button className="dropdown-item"><i className="bi bi-moon-stars me-2"></i>Dark Mode</button></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="d-flex flex-column flex-md-row h-100 overflow-hidden">
        {/* Editor Pane */}
        <div className="w-100 w-md-50 border-end border-secondary border-opacity-25 h-50 h-md-100">
          <Editor
            height="100%"
            language={activeTab === 'js' ? 'javascript' : activeTab}
            theme="vs-dark"
            value={activeTab === "html" ? html : activeTab === "css" ? css : js}
            onChange={(value) => {
              if (activeTab === "html") setHtml(value);
              if (activeTab === "css") setCss(value);
              if (activeTab === "js") setJs(value);
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              padding: { top: 16 }
            }}
          />
        </div>

        {/* Live Preview Pane */}
        <div className="w-100 w-md-50 h-50 h-md-100 bg-dark d-flex flex-column align-items-center justify-content-center p-2">
          <div 
            className="bg-white rounded overflow-hidden shadow-lg transition-all"
            style={{ 
              width: getDeviceWidth(), 
              height: "100%", 
              transition: "width 0.3s ease",
              border: devicePreview !== 'desktop' ? '10px solid #333' : 'none',
              borderRadius: devicePreview !== 'desktop' ? '20px' : '4px'
            }}
          >
            <iframe
              srcDoc={srcDoc}
              title="output"
              sandbox="allow-scripts"
              frameBorder="0"
              width="100%"
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebEditor;
