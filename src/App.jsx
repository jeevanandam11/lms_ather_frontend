import React, { useState, useEffect } from "react";

import "./App.css";
import Sidebar from "./components/sidebar/Sidebar";
import Dashboard from "./components/dashboard/Dashboard";
import LearningLab from "./components/learninglab/LearningLab";
import ResumeHub from "./components/resumehub/ResumeHub";
import PlacementGuide from "./components/placementguide/PlacementGuide";
import Library from "./components/library/Library";
import AetherPlayer from "./components/atherplayer/AtherPlayer";
import Auth from "./components/auth/Auth";
import Profile from "./components/profile/Profile";
import QuizTest from "./components/quiztest/QuizTest";
import MyCertificate from "./components/certificate/MyCertificate";
import MockInterview from "./components/mockinterview/MockInterview";

function App() {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(
    localStorage.getItem("appTheme") || "dark",
  );

  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get("view");
  const topicParam = params.get("topic") || "";

  const [currentView, setCurrentView] = useState(
    viewParam === "player" ? "player" : "home",
  );
  const [activeTopic, setActiveTopic] = useState(topicParam);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const handleNav = (e) => {
      if (typeof e.detail === 'object' && e.detail.view) {
        setCurrentView(e.detail.view);
        if (e.detail.topic) setActiveTopic(e.detail.topic);
      } else {
        setCurrentView(e.detail);
      }
    };
    window.addEventListener("navigate", handleNav);
    return () => window.removeEventListener("navigate", handleNav);
  }, []);

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
    localStorage.setItem("appTheme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="container-fluid p-0 overflow-hidden vh-100">
      <div className="row g-0 h-100">
        {/* Sidebar wrapper with conditional width */}
        <div
          className={`sidebar-wrapper transition-all ${isSidebarOpen ? "col-md-2" : "d-none"}`}
        >
          <Sidebar
            onNavigate={setCurrentView}
            activeView={currentView}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        </div>

        {/* Main Content Area */}
        <main
          className={`${isSidebarOpen ? "col-md-10" : "col-md-12"} h-100 overflow-auto`}
        >
          {currentView === "home" ? (
            <Dashboard
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              onNavigate={setCurrentView}
            />
          ) : currentView === "lab" ? (
            <LearningLab
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          ) : currentView === "resume" ? (
            <ResumeHub
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          ) : currentView === "placement" ? (
            <PlacementGuide
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          ) : currentView === "library" ? (
            <Library
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          ) : currentView === "profile" ? (
            <Profile
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          ) : currentView === "quiz" ? (
            <QuizTest
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          ) : currentView === "certificate" ? (
            <MyCertificate
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          ) : currentView === "mockInterview" ? (
            <MockInterview
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          ) : currentView === "player" ? (
            <div className="h-100">
              <AetherPlayer topic={activeTopic} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default App;
