import React, { useState } from "react";
import axios from "axios";
import "../../App.css"; // assuming app.css has bootstrap and some globals

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password strength calculation
  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length > 7) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[@#$%^&+=!]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = calculateStrength(password);
  
  let strengthLabel = "WEAK";
  let strengthWidth = "20%";
  let strengthColor = "#ef4444"; // red

  if (strengthScore >= 4) {
    strengthLabel = "STRONG";
    strengthWidth = "100%";
    strengthColor = "linear-gradient(90deg, #f97316 0%, #8b5cf6 100%)";
  } else if (strengthScore >= 2) {
    strengthLabel = "MODERATE";
    strengthWidth = "60%";
    strengthColor = "#eab308"; // yellow
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const res = await axios.post(`http://localhost:8080${endpoint}`, {
        email,
        password
      });
      // Success: Save user to local storage and trigger parent
      localStorage.setItem("user", JSON.stringify(res.data));
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#0b1120", fontFamily: "'Inter', sans-serif" }}>
      <div className="card border-0 p-4" style={{ backgroundColor: "transparent", maxWidth: "460px", width: "100%" }}>
        
        <h2 className="fw-bold text-white mb-2" style={{ fontSize: "2rem", letterSpacing: "-0.5px" }}>
          {isLogin ? "Welcome Back" : "Start Your AI-Powered Journey"}
        </h2>
        <p className="mb-4" style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
          {isLogin ? "Log in to your elite learning ecosystem." : "Join the elite learning ecosystem today."}
        </p>

        {/* Social Buttons */}
        <div className="d-flex gap-3 mb-4">
          <button className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: "transparent", border: "1px solid #1e293b", color: "#f8fafc", borderRadius: "8px", padding: "10px" }}>
             <i className="bi bi-google text-white"></i> Google
          </button>
          <button className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: "transparent", border: "1px solid #1e293b", color: "#f8fafc", borderRadius: "8px", padding: "10px" }}>
             <i className="bi bi-github text-white"></i> GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="d-flex align-items-center mb-4">
          <div className="flex-grow-1" style={{ height: "1px", backgroundColor: "#1e293b" }}></div>
          <span className="px-3" style={{ color: "#64748b", fontSize: "0.75rem", letterSpacing: "1px" }}>OR CONTINUE WITH EMAIL</span>
          <div className="flex-grow-1" style={{ height: "1px", backgroundColor: "#1e293b" }}></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          
          {error && <div className="alert alert-danger py-2 small border-0" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>{error}</div>}

          <div className="mb-3">
            <label className="form-label text-white" style={{ fontSize: "0.85rem" }}>Email Address</label>
            <div className="input-group">
              <span className="input-group-text border-0" style={{ backgroundColor: "#111827", color: "#64748b" }}>
                <i className="bi bi-envelope-fill"></i>
              </span>
              <input 
                type="email" 
                className="form-control border-0 shadow-none text-white" 
                placeholder="name@company.com" 
                style={{ backgroundColor: "#111827" }}
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <label className="form-label text-white mb-1" style={{ fontSize: "0.85rem" }}>Password</label>
              <a href="#" style={{ color: "#f97316", fontSize: "0.8rem", textDecoration: "none" }}>Forgot?</a>
            </div>
            
            <div className="input-group mb-2">
              <span className="input-group-text border-0" style={{ backgroundColor: "#111827", color: "#64748b" }}>
                <i className="bi bi-lock-fill"></i>
              </span>
              <input 
                type="password" 
                className="form-control border-0 shadow-none text-white" 
                placeholder="••••••••" 
                style={{ backgroundColor: "#111827", letterSpacing: "2px" }}
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
              />
            </div>

            {/* Password Strength Indicator (only in signup mode) */}
            {!isLogin && password.length > 0 && (
              <div className="mt-3">
                <div style={{ height: "4px", backgroundColor: "#1e293b", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: strengthWidth, background: strengthColor, transition: "all 0.3s ease" }}></div>
                </div>
                <div className="mt-1" style={{ color: "#64748b", fontSize: "0.65rem", letterSpacing: "1px", textTransform: "uppercase", fontWeight: "600" }}>
                  SECURITY: <span style={{ color: strengthScore >= 4 ? "#8b5cf6" : strengthColor }}>{strengthLabel}</span>
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn w-100 fw-bold border-0 py-3 mb-4 d-flex justify-content-center align-items-center gap-2" 
            style={{ backgroundColor: "#ea580c", color: "white", borderRadius: "8px", transition: "transform 0.2s" }}
            disabled={loading}
          >
            {loading ? "Processing..." : isLogin ? "Sign In →" : "Claim Your Career OS →"}
          </button>

          <p className="text-center mb-0" style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              onClick={() => {setIsLogin(!isLogin); setError(""); setPassword(""); }} 
              style={{ color: "#ea580c", cursor: "pointer", fontWeight: "600" }}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </span>
          </p>
        </form>

      </div>
    </div>
  );
};

export default Auth;
