import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// 1. Global Styles (Bootstrap first, then your overrides)
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

// 2. Main App Component
import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
