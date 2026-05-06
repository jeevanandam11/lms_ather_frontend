import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

const Compiler = () => {
  const defaultComments = {
    java: "// Write your Java code here",
    python: "# Write your Python code here",
    cpp: "// Write your C++ code here",
    c: "// Write your C code here",
    javascript: "// Write your JavaScript code here",
  };

  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState(defaultComments["java"]);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [editorTheme, setEditorTheme] = useState(
    document.body.classList.contains("light-theme") ? "vs" : "vs-dark"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setEditorTheme(document.body.classList.contains("light-theme") ? "vs" : "vs-dark");
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Map to default filenames for OneCompiler
  const fileNames = {
    java: "Main.java",
    python: "main.py",
    cpp: "main.cpp",
    c: "main.c",
    javascript: "main.js",
  };

  const runCode = async () => {
    setOutput("Running...");
    setIsRunning(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/compiler/execute",
        {
          properties: {
            language: language,
            files: [
              {
                name: fileNames[language],
                content: code
              }
            ]
          }
        }
      );

      if (response.data.exception) {
        setOutput(response.data.exception);
      } else if (response.data.stderr) {
        setOutput(response.data.stderr);
      } else {
        setOutput(response.data.stdout || "Execution completed with no output.");
      }
    } catch (error) {
      setOutput("Error running code: " + (error.response?.data?.message || error.message));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Top Bar */}
      <div className="bg-dark text-white border-bottom border-secondary border-opacity-25" style={{ padding: "10px", display: "flex", gap: "10px" }}>
        <select 
          value={language} 
          onChange={(e) => {
            const newLang = e.target.value;
            setLanguage(newLang);
            if (!code.trim() || Object.values(defaultComments).includes(code.trim())) {
              setCode(defaultComments[newLang]);
            }
          }}
          className="bg-dark text-white border-secondary border-opacity-25"
          style={{ padding: "5px", borderRadius: "5px", border: "1px solid" }}
        >
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="javascript">JavaScript</option>
        </select>

        <button 
          onClick={runCode}
          disabled={isRunning}
          style={{ 
            padding: "5px 15px", 
            borderRadius: "5px", 
            background: isRunning ? "#059669" : "#10b981", 
            color: "white", 
            border: "none", 
            cursor: isRunning ? "not-allowed" : "pointer" 
          }}
        >
          {isRunning ? "Running..." : "▶ Run"}
        </button>
      </div>

      {/* Code Editor */}
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          theme={editorTheme}
          language={language === "c" || language === "cpp" ? "cpp" : language}
          value={code}
          onChange={(value) => setCode(value)}
        />
      </div>

      {/* Output Panel */}
      <div
        className="bg-dark text-white border-top border-secondary border-opacity-25"
        style={{
          height: "200px",
          padding: "10px",
          overflowY: "auto"
        }}
      >
        <h6 style={{ margin: "0 0 5px 0", color: "#94a3b8" }}>Output</h6>
        <pre style={{ margin: 0, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{output || "Click Run to execute your code..."}</pre>
      </div>
    </div>
  );
};

export default Compiler;
