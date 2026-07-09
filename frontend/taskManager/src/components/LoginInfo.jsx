import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// Make sure this path is correct based on where your hook is stored!
import { useTheme } from "../hooks/useTheme";

export default function LoginInfo() {
  const [osHistory, setOsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme } = useTheme(); 

  useEffect(() => {
    const fetchOsHistory = async () => {
      try {
        const token = localStorage.getItem("mySecureToken");
        const res = await axios.get(
          "http://localhost:8080/authuser/os-logins",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setOsHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch OS login history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOsHistory();
  }, []);

  return (
    <div className={`li-container ${theme}`}>
      <div className="li-card">
        <div className="li-header">
          <h2 className="li-title">System Login History</h2>
          <button onClick={() => navigate("/dashboard")} className="li-back-btn">
            ← Back to Dashboard
          </button>
        </div>

        {loading ? (
          <p className="li-message">Loading security logs...</p>
        ) : osHistory.length === 0 ? (
          <p className="li-message">No login history found.</p>
        ) : (
          <div className="li-list">
            {osHistory.map((info, index) => (
              <div
                key={info._id}
                className={`li-item ${index === 0 ? "li-item-recent" : ""}`}
              >
                <div className="li-item-header">
                  <h3 className="li-item-title">
                    {info.platform.toUpperCase()} - {info.architecture}
                  </h3>
                  <span className="li-item-time">
                    {new Date(info.loginTime).toLocaleString()}
                  </span>
                </div>

                <div className="li-grid">
                  <p>
                    <span className="li-font-semibold">Host:</span>{" "}
                    {info.hostname}
                  </p>
                  <p>
                    <span className="li-font-semibold">RAM:</span>{" "}
                    {info.totalMemoryGB} GB
                  </p>
                  <p className="li-grid-full">
                    <span className="li-font-semibold">CPU:</span>{" "}
                    {info.cpuModel}
                  </p>
                </div>

                {index === 0 && (
                  <span className="li-badge">Most Recent Login</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
