import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../App.css";

const Header = ({ isSidebarOpen, toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    };
    loadUser();
    window.addEventListener("userUpdated", loadUser);
    
    // Fetch user history for search
    const fetchHistory = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const u = JSON.parse(stored);
          const res = await axios.get(`http://localhost:8080/api/history/user/${u.id}`);
          setHistory(res.data);
        }
      } catch (e) {
        console.error("Failed to fetch history for search", e);
      }
    };
    fetchHistory();

    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const u = JSON.parse(stored);
          const res = await axios.get(`http://localhost:8080/api/notifications/user/${u.id}`);
          setNotifications(res.data);
        }
      } catch (e) {
        console.error("Failed to fetch notifications", e);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);

    return () => {
      window.removeEventListener("userUpdated", loadUser);
      clearInterval(interval);
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header
        className={`d-flex justify-content-between align-items-center pt-2 pb-2 ps-3 pe-3 sticky-top bg-purple z-1 transition-all ${
          isSidebarOpen ? "col-md-10" : "col-md-12"
        }`}
      >
        <div className="d-flex align-items-center gap-3 p-3">
          <button
            className="btn btn-dark border-0 shadow-none d-flex align-items-center justify-content-center"
            onClick={() => {
              toggleSidebar();
            }}
            style={{
              backgroundColor: "rgba(232, 73, 73, 0.05)",
              width: "40px",
              height: "40px",
            }}
          >
            <i
              className={`bi ${isSidebarOpen ? "bi-text-indent-right" : "bi-list"} fs-4`}
            ></i>
          </button>

          <div>
            <h2 className="fw-bold mb-0 fs-4">
              Welcome back,{" "}
              {user ? user.firstName || user.email.split("@")[0] : "Guest"}
            </h2>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3 p-3">
          <div className="position-relative">
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input
              type="text"
              className="form-control bg-light border-0 text-dark ps-5 shadow-none"
              placeholder="Search knowledge base..."
              style={{ width: "300px", borderRadius: "10px" }}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(e.target.value.trim().length > 0);
              }}
              onFocus={() => {
                if (searchQuery.trim().length > 0) setShowDropdown(true);
              }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {showDropdown && (
              <div 
                className="position-absolute bg-dark text-light w-100 mt-1 rounded shadow-lg overflow-auto z-3" 
                style={{ maxHeight: "300px", border: "1px solid rgba(255,255,255,0.1)", top: "100%", left: 0 }}
              >
                {history.filter(h => h.topicName.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                  history.filter(h => h.topicName.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3 border-bottom border-secondary border-opacity-25 hover-glow cursor-pointer"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("navigate", { detail: { view: "player", topic: item.topicName } }));
                        window.history.pushState(null, '', "?view=player&topic=" + encodeURIComponent(item.topicName));
                        setShowDropdown(false);
                      }}
                    >
                      <div className="fw-bold">{item.topicName}</div>
                      <small className="text-muted d-block mt-1">Generated: {new Date(item.createdAt).toLocaleDateString()}</small>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-muted small">No generated courses found.</div>
                )}
              </div>
            )}
          </div>
          <div className="position-relative px-2">
            <i 
              className="bi bi-bell fs-5 text-muted hover-glow cursor-pointer"
              style={{ cursor: "pointer" }}
              onClick={() => setShowNotifications(!showNotifications)}
            ></i>
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
                style={{ width: "8px", height: "8px" }}
              ></span>
            )}
            
            {showNotifications && (
              <div 
                className="position-absolute bg-dark text-light mt-2 rounded shadow-lg z-3" 
                style={{ width: "300px", right: 0, border: "1px solid rgba(255,255,255,0.1)", maxHeight: "400px", overflowY: "auto" }}
              >
                <div className="p-3 border-bottom border-secondary border-opacity-25 fw-bold d-flex justify-content-between align-items-center">
                  <span>Notifications</span>
                  {unreadCount > 0 && <span className="badge bg-danger">{unreadCount} New</span>}
                </div>
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-3 border-bottom border-secondary border-opacity-25 hover-glow cursor-pointer ${!n.read ? 'bg-secondary bg-opacity-25' : ''}`}
                      onClick={() => {
                        if (!n.read) markAsRead(n.id);
                      }}
                    >
                      <div className="fw-bold" style={{ fontSize: "0.9rem" }}>{n.title}</div>
                      <div className="text-muted mt-1" style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>{n.message}</div>
                      <small className="text-muted d-block mt-2" style={{ fontSize: "0.7rem" }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </small>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted small">No notifications yet.</div>
                )}
              </div>
            )}
          </div>
          <div
            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold overflow-hidden profile-avatar"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("navigate", { detail: "profile" }),
              )
            }
            style={{
              width: "40px",
              height: "40px",
              cursor: "pointer",
              background: user?.imageUrl
                ? "none"
                : "linear-gradient(45deg, #2d334a, #1a1d2b)",
            }}
          >
            {user?.imageUrl ? (
              <img
                src={`http://localhost:8080/uploads/${user.imageUrl}`}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : user ? (
              user.firstName ? (
                user.firstName.charAt(0).toUpperCase()
              ) : (
                user.email.charAt(0).toUpperCase()
              )
            ) : (
              "G"
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
