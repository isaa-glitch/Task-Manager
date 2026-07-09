import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useViewMode } from "../hooks/useViewMode";
import { useTheme } from "../hooks/useTheme";
import ProfileDropdown from "./ProfileDropdown";

function Hidden() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const { viewMode, toggleViewMode } = useViewMode("card");
  const { theme, toggleTheme } = useTheme("light");

  useEffect(() => {
    const token = localStorage.getItem("mySecureToken");
    if (!token) {
      navigate("/login");
    } else {
      fetchTasks();
    }
  }, [navigate]);

   useEffect(() => {
     const token = localStorage.getItem("mySecureToken");
    fetchTasks()
   }, [theme]);

  const fetchTasks = async () => {
    const token = localStorage.getItem("mySecureToken");
    try {
      const res = await axios.get("http://localhost:8080/task/hidden", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (error) {
      if (error.response?.status === 401) navigate("/login");
    }
  };

  const handleRestore = async (id) => {
    const token = localStorage.getItem("mySecureToken");
    try {
      const result = await axios.patch(
        `http://localhost:8080/task/restore/${id}`,
        { isDeleted: false },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(`restored user`, result.data);
      fetchTasks();
    } catch (error) {
      console.error("Restore failed", error.response?.data || error.message);
    }
  };

  const handleHardDelete = async (id) => {
    const token = localStorage.getItem("mySecureToken");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      await axios.delete(
        `http://localhost:8080/task/hard-delete/${id}`,
        config,
      );
      fetchTasks();
    } catch (error) {
      console.error("Hard deletion failed", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title?.toLowerCase().includes(q) ||
      task.user?.email?.toLowerCase().includes(q) ||
      task.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className={`db-root ${theme}`}
      style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}
    >
      <div
        className="db-hidden-topbar"
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <button
          className="db-btn db-btn-ghost"
          onClick={() => navigate("/dashboard")}
        >
          ← Back
        </button>

        <h2 style={{ margin: 0 }}>Soft Deleted Tasks</h2>
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <ProfileDropdown
            theme={theme}
            toggleTheme={toggleTheme}
            viewMode={viewMode}
            toggleViewMode={toggleViewMode}
          />
        </div>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Search by title, email, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="db-input db-search"
          style={{ width: "100%" }}
        />
      </div>

      {viewMode === "card" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className="db-card db-card-archived"
              style={{
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              {task.user?.email && (
                <p className="db-owner-tag" style={{ fontSize: "12px" }}>
                  Owner: {task.user.email}
                </p>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  className="db-btn db-btn-ghost"
                  onClick={() => handleRestore(task._id)}
                >
                  Restore
                </button>
                <button
                  className="db-btn db-btn-danger"
                  onClick={() => handleHardDelete(task._id, false)}
                >
                  Hard Delete
                </button>
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && <p>No deleted tasks found.</p>}
        </div>
      ) : (
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task._id}>
                  <td style={{ padding: "10px" }}>{task.title}</td>
                  <td style={{ padding: "10px" }}>{task.description || "—"}</td>
                  <td style={{ padding: "10px" }}>{task.user?.email || "—"}</td>
                  <td style={{ padding: "10px", display: "flex", gap: "8px" }}>
                    <button
                      className="db-btn db-btn-ghost"
                      onClick={() => handleRestore(task._id)}
                    >
                      Restore
                    </button>
                    <button
                      className="db-btn db-btn-danger"
                      onClick={() => handleHardDelete(task._id)}
                    >
                      Hard Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{ padding: "20px", textAlign: "center" }}
                  >
                    No deleted tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Hidden;
