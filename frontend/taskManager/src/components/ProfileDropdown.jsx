import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileDropdown({
  theme,
  toggleTheme,
  viewMode,
  toggleViewMode,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("mySecureToken");
    navigate("/login");
  };

  const closeAndNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="pd-container" ref={dropdownRef}>
      {/* Chic Profile Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="pd-toggle-btn">
        <svg
          className="pd-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          ></path>
        </svg>
      </button>

      {/* The Dropdown Panel */}
      {isOpen && (
        <div className="pd-menu">
          {/* Section 1: Preferences */}
          <div className="pd-section">
            <p>Preferences</p>
          </div>
          <div>
            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="pd-action-btn"
            >
              <span className="pd-emoji">
                {theme === "light" ? "🌙" : "☀️"}
              </span>
              <span className="pd-text">Theme</span>
              <span className="pd-badge">
                {theme === "light" ? "Light" : "Dark"}
              </span>
            </button>

            <button
              onClick={() => {
                toggleViewMode();
                setIsOpen(false);
              }}
              className="pd-action-btn"
            >
              <span className="pd-emoji">
                {viewMode === "card" ? "📋" : "🗂️"}
              </span>
              <span className="pd-text">Layout</span>
              <span className="pd-badge">
                {viewMode === "card" ? "Card" : "Table"}
              </span>
            </button>
          </div>

          {/* Section 2: Task Management */}
          <div className="pd-section">
            <p>Task Management</p>
          </div>
          <div>
            <button
              onClick={() => closeAndNavigate("/hidden")}
              className="pd-action-btn"
            >
              <span className="pd-emoji">🗑️</span>
              <span className="pd-text">Soft Deleted Tasks</span>
              <span className="pd-arrow">→</span>
            </button>
          </div>

          {/* Section 3: Account & Security */}
          <div className="pd-section">
            <p>Account & Security</p>
          </div>
          <div>
            <button
              onClick={() => closeAndNavigate("/change-password")}
              className="pd-action-btn"
            >
              <span className="pd-emoji">🔑</span>
              <span className="pd-text">Reset Password</span>
              <span className="pd-arrow">→</span>
            </button>

            <button
              onClick={() => closeAndNavigate("/LoginInfo")}
              className="pd-action-btn"
            >
              <span className="pd-emoji">🛡️</span>
              <span className="pd-text">Security Logs</span>
              <span className="pd-arrow">→</span>
            </button>

            <button onClick={handleLogout} className="pd-logout-btn">
              <span className="pd-emoji">🚪</span>
              <span className="pd-logout-text">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
