import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useViewMode } from "../hooks/useViewMode";
import { useTheme } from "../hooks/useTheme";
import moment from "moment";
import TaskCalendar from "./TaskCalendar";
import PdfDownload from "./PdfDownload";
import ProfileDropdown from "./ProfileDropdown";


export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  const [usersList, setUsersList] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [viewFilter, setViewFilter] = useState("all");
  const [showPopup, setShowPopup] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const { viewMode, toggleViewMode } = useViewMode("card");
  const { theme, toggleTheme } = useTheme();

  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("mySecureToken");
    if (!token) {
      navigate("/login");
    } else {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Invalid token format:", error);
      }
      fetchTasks();
      fetchUsers();
    }
  }, [navigate]);

  const fetchTasks = async () => {
    const token = localStorage.getItem("mySecureToken");
    try {
      const res = await axios.get("http://localhost:8080/task/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
      console.log(`taskss`, res.data);
    } catch (error) {
      if (error.response?.status === 401) navigate("/login");
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("mySecureToken");
    try {
      const res = await axios.get("http://localhost:8080/authuser/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`usersListt`, res.data);
      setUsersList(res.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("mySecureToken");
    const payload = { title, description, dueDate, assignedTo };

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("dueDate", dueDate);
    formData.append("assignedTo", assignedTo);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editId) {
        await axios.put(
          `http://localhost:8080/task/update/${editId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setEditId(null);
      } else {
        await axios.post("http://localhost:8080/task/add", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setTitle("");
      setDescription("");
      setDueDate("");
      setAssignedTo("");
      setImageFile(null);
      setShowPopup(false);
      fetchTasks();
    } catch (error) {
      console.error("Action failed!", error.response?.data || error.message);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const token = localStorage.getItem("mySecureToken");
    const statuses = ["pending", "in-progress", "completed"];
    const nextStatus =
      statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];



    try {
      await axios.put(
        `http://localhost:8080/task/update/${id}`,
        { status: nextStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchTasks();
    } catch (error) {
      console.error("Status update failed", error);
    }
  };

  const handleSoftDelete = async (id) => {
    const token = localStorage.getItem("mySecureToken");
    try {
      await axios.patch(
        `http://localhost:8080/task/softdelete/${id}`,
        { isDeleted: true },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchTasks();
    } catch (error) {
      console.error(
        "Soft deletion failed",
        error.response?.data || error.message,
      );
    }
  };

  const handleHardDelete = async (id) => {
    const token = localStorage.getItem("mySecureToken");
    try {
      await axios.delete(`http://localhost:8080/task/hard-delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      console.error("Hard deletion failed", error);
    }
  };

  const startEdit = (task) => {
    setEditId(task._id);
    setTitle(task.title);
    setDescription(task.description || "");
    setDueDate(task.dueDate ? task.dueDate.substring(0, 10) : "");
    setAssignedTo(task.assignedTo?._id || "");
    setShowPopup(true);
  };

  const getTaskBackgroundColor = (task) => {
    if (task.status === "completed")
      return theme === "dark" ? "#14532d" : "#dcfce7";
    if (task.status === "in-progress")
      return theme === "dark" ? "#561271" : "#f48afe";

    if (task.status === "pending" && task.dueDate) {
      const isOverdue = moment(task.dueDate).isBefore(moment(), "day");
      if (isOverdue) return theme === "dark" ? "#7f1d1d" : "#fee2e2";
    }

    return theme === "dark" ? "#334155" : "#ffffff";
  };

  // const displayedTasks = tasks.filter((task) => {
  //   if (viewFilter === "all") return true;
  //   if (viewFilter === "toMe" && task.assignedTo?._id === user?.id) return true;
  //   if (viewFilter === "byMe" && task.assignedBy?._id === user?.id) return true;
  //   return false;
  // });

  let processedTasks = tasks.filter((task) => {
    if (viewFilter === "toMe" && task.assignedTo?._id !== user?.id)
      return false;
    if (viewFilter === "byMe" && task.assignedBy?._id !== user?.id)
      return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchAssignee = (task.assignedTo?.email || "")
        .toLowerCase()
        .includes(query);
      const matchAssigner = (task.assignedBy?.email || "")
        .toLowerCase()
        .includes(query);

      if (!matchTitle && !matchAssignee && !matchAssigner) return false;
    }

    return true;
  });

  

  return (
    <div
      className={`db-root ${theme}`}
      style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}
    >
      {user && (
        <div className="db-user-info" style={{ marginBottom: "20px" }}>
          <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>
            Logged in as: <span style={{ color: "red" }}>({user.role})</span>
          </p>
          <strong style={{ fontSize: "16px" }}>{user.email}</strong>
        </div>
      )}

      <div
        className="db-topbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Task Dashboard</h2>
        <ProfileDropdown
          theme={theme}
          toggleTheme={toggleTheme}
          viewMode={viewMode}
          toggleViewMode={toggleViewMode}
        />
        {/* <div style={{ display: "flex", gap: "10px" }}>
          <button className="db-btn db-btn-ghost" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
          <button className="db-btn db-btn-ghost" onClick={toggleViewMode}>
            {viewMode === "card" ? "📋 Table View" : "🗂️ Card View"}
          </button>
          <button
            className="db-btn db-btn-ghost"
            onClick={() => navigate("/hidden")}
          >
            Soft Deleted
          </button>
          <button
            className="db-btn db-btn-ghost"
            onClick={() => navigate("/change-password")}
          >
            Reset Password
          </button>
          <button
            className="db-btn db-btn-danger"
            onClick={() => {
              localStorage.removeItem("mySecureToken");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div> */}
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          className={`db-btn db-tab ${viewFilter === "all" ? "db-tab-active" : "db-btn-ghost"}`}
          onClick={() => setViewFilter("all")}
        >
          All Tasks
        </button>
        <button
          className={`db-btn db-tab ${viewFilter === "toMe" ? "db-tab-active" : "db-btn-ghost"}`}
          onClick={() => setViewFilter("toMe")}
        >
          Assigned To Me
        </button>
        <button
          className={`db-btn db-tab ${viewFilter === "byMe" ? "db-tab-active" : "db-btn-ghost"}`}
          onClick={() => setViewFilter("byMe")}
        >
          Assigned By Me
        </button>

        <button
          className="db-btn db-btn-primary"
          onClick={() => {
            setEditId(null);
            setTitle("");
            setDescription("");
            setDueDate("");
            setAssignedTo("");
            setShowPopup(true);
          }}
          style={{ marginLeft: "auto" }}
        >
          + Add Task
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "15px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search by task title or user email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="db-input db-search"
          style={{
            flex: 1,
            minWidth: "200px",
          }}
        />
      </div>

      <div
        style={{
          marginBottom: "30px",
          paddingBottom: "20px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <TaskCalendar tasks={tasks} user={user} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {processedTasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : viewMode === "card" ? (
          /* --- CARD VIEW --- */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              marginTop: "20px",
            }}
          >
            {processedTasks.map((task) => (
              <div
                key={task._id}
                className="db-card"
                style={{
                  padding: "15px",
                  borderRadius: "8px",
                  backgroundColor: getTaskBackgroundColor(task),
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h3 style={{ margin: "0 0 10px 0" }}>{task.title}</h3>
                  <PdfDownload task={task} />
                  {task.status !== "completed" &&
                    task.dueDate &&
                    moment(task.dueDate).isBefore(moment(), "day") && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "bold",
                          color: "#ef4444",
                          backgroundColor: "#fee2e2",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          border: "1px solid #ef4444",
                        }}
                      >
                        ⚠️ OVERDUE
                      </span>
                    )}
                  <span className={`db-badge db-badge-${task.status}`}>
                    {task.status.toUpperCase()}
                  </span>
                </div>
                <p>{task.description}</p>
                {task.images && (
                  <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                    <img
                      src={task.images}
                      alt="Task Attachment"
                      style={{
                        width: "120px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid rgba(0,0,0,0.1)",
                      }}
                    />
                  </div>
                )}
                <div
                  className="db-card-meta"
                  style={{
                    display: "flex",
                    gap: "20px",
                    fontSize: "12px",
                    paddingTop: "10px",
                  }}
                >
                  <p>
                    <strong>From:</strong> {task.assignedBy?.email || "Unknown"}
                  </p>
                  <p>
                    <strong>To:</strong> {task.assignedTo?.email || "Unknown"}
                  </p>
                  <p>
                    <strong>Due:</strong>{" "}
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "No Date"}
                  </p>
                </div>
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "15px" }}
                >
                  {task.status === "completed" &&
                  user?.role !== "admin" &&
                  task.assignedBy?._id !== user?.id ? (
                    <button
                      disabled
                      style={{
                        cursor: "not-allowed",
                        opacity: 0.6,
                        backgroundColor: "#94a3b8",
                      }}
                    >
                      Locked (Completed)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(task._id, task.status)}
                    >
                      Change Status
                    </button>
                  )}

                  {(user?.role === "admin" ||
                    task.assignedBy?._id === user?.id) && (
                    <>
                      <button
                        className="db-btn db-btn-ghost"
                        onClick={() => startEdit(task)}
                      >
                        Edit
                      </button>
                      <button
                        className="db-btn db-btn-warn"
                        onClick={() => handleSoftDelete(task._id)}
                      >
                        Soft Delete
                      </button>
                      <button
                        className="db-btn db-btn-danger"
                        onClick={() => handleHardDelete(task._id)}
                      >
                        Hard Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* --- TABLE VIEW --- */
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedTasks.map((task) => (
                  <tr
                    key={task._id}
                    style={{
                      backgroundColor: getTaskBackgroundColor(task),
                    }}
                  >
                    <td style={{ padding: "10px" }}>{task.title}</td>
                    <td style={{ padding: "10px" }}>
                      {task.assignedTo?.email || "Unknown"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "No Date"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      <span className={`db-badge db-badge-${task.status}`}>
                        {task.status.toUpperCase()}
                      </span>
                      {task.status !== "completed" &&
                        task.dueDate &&
                        moment(task.dueDate).isBefore(moment(), "day") && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "bold",
                              color: "#ef4444",
                            }}
                          >
                            ⚠️ OVERDUE
                          </span>
                        )}
                    </td>
                    <td
                      style={{ padding: "10px", display: "flex", gap: "5px" }}
                    >
                      <PdfDownload task={task} />
                      {task.status === "completed" &&
                      user?.role !== "admin" &&
                      task.assignedBy?._id !== user?.id ? (
                        <button
                          disabled
                          style={{
                            cursor: "not-allowed",
                            opacity: 0.6,
                            backgroundColor: "#94a3b8",
                          }}
                        >
                          Locked (Completed)
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleStatusChange(task._id, task.status)
                          }
                        >
                          Change Status
                        </button>
                      )}
                      {(user?.role === "admin" ||
                        task.assignedBy?._id === user?.id) && (
                        <button
                          className="db-btn db-btn-ghost"
                          onClick={() => startEdit(task)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showPopup && (
        <div className="db-modal-overlay">
          <div className="db-modal">
            <h3>{editId ? "Update Task" : "Create New Task"}</h3>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="db-input"
              />

              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="db-input db-textarea"
              />

              <div>
                <label className="db-label">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="db-input"
                />
              </div>

              <div>
                <label className="db-label">Assign To</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  required
                  className="db-input"
                >
                  <option value="" disabled>
                    Select a user...
                  </option>
                  {usersList.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="db-label">Attachment (Image)</label>
                <input
                  type="file"
                  accept="image/*" // Only allow image files
                  onChange={(e) => setImageFile(e.target.files[0])} // Grab the actual file object
                  className="db-input"
                  style={{ padding: "8px", background: "transparent" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="submit"
                  className="db-btn db-btn-primary"
                  style={{ flex: 1 }}
                >
                  {editId ? "Update Task" : "Submit Task"}
                </button>
                <button
                  type="button"
                  className="db-btn db-btn-danger"
                  onClick={() => setShowPopup(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import { useViewMode } from "../hooks/useViewMode";
// import { useTheme } from "../hooks/useTheme";
// import moment from "moment";

// export default function Dashboard() {
//   const [tasks, setTasks] = useState([]);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [editId, setEditId] = useState(null);
//   const [user, setUser] = useState({});
//   const navigate = useNavigate();

//   const [usersList, setUsersList] = useState([]);
//   const [dueDate, setDueDate] = useState("");
//   const [assignedTo, setAssignedTo] = useState("");
//   const [viewFilter, setViewFilter] = useState("all");
//   const [showPopup, setShowPopup] = useState(false);

//   const [searchQuery, setSearchQuery] = useState("");

//   const { viewMode, toggleViewMode } = useViewMode("card");
//   const { theme, toggleTheme } = useTheme("light");

//   useEffect(() => {
//     const token = localStorage.getItem("mySecureToken");
//     if (!token) {
//       navigate("/login");
//     } else {
//       try {
//         const decoded = jwtDecode(token);
//         setUser(decoded);
//       } catch (error) {
//         console.error("Invalid token format:", error);
//       }
//       fetchTasks();
//       fetchUsers();
//     }
//   }, [navigate]);

//   const fetchTasks = async () => {
//     const token = localStorage.getItem("mySecureToken");
//     try {
//       const res = await axios.get("http://localhost:8080/task/all", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setTasks(res.data);
//       console.log(`taskss`, res.data);
//     } catch (error) {
//       if (error.response?.status === 401) navigate("/login");
//     }
//   };

//   const fetchUsers = async () => {
//     const token = localStorage.getItem("mySecureToken");
//     try {
//       const res = await axios.get("http://localhost:8080/authuser/users", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log(`usersListt`, res.data);
//       setUsersList(res.data);
//     } catch (error) {
//       console.error("Failed to fetch users", error);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const token = localStorage.getItem("mySecureToken");
//     const payload = { title, description, dueDate, assignedTo };

//     try {
//       if (editId) {
//         await axios.put(
//           `http://localhost:8080/task/update/${editId}`,
//           payload,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );
//         setEditId(null);
//       } else {
//         await axios.post("http://localhost:8080/task/add", payload, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       }

//       setTitle("");
//       setDescription("");
//       setDueDate("");
//       setAssignedTo("");
//       setShowPopup(false);
//       fetchTasks();
//     } catch (error) {
//       console.error("Action failed!", error.response?.data || error.message);
//     }
//   };

//   const handleStatusChange = async (id, currentStatus) => {
//     const token = localStorage.getItem("mySecureToken");
//     const statuses = ["pending", "in-progress", "completed"];
//     const nextStatus =
//       statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

//     try {
//       await axios.put(
//         `http://localhost:8080/task/update/${id}`,
//         { status: nextStatus },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       fetchTasks();
//     } catch (error) {
//       console.error("Status update failed", error);
//     }
//   };

//   const handleSoftDelete = async (id) => {
//     const token = localStorage.getItem("mySecureToken");
//     try {
//       await axios.patch(
//         `http://localhost:8080/task/softdelete/${id}`,
//         { isDeleted: true },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       fetchTasks();
//     } catch (error) {
//       console.error(
//         "Soft deletion failed",
//         error.response?.data || error.message,
//       );
//     }
//   };

//   const handleHardDelete = async (id) => {
//     const token = localStorage.getItem("mySecureToken");
//     try {
//       await axios.delete(`http://localhost:8080/task/hard-delete/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       fetchTasks();
//     } catch (error) {
//       console.error("Hard deletion failed", error);
//     }
//   };

//   const startEdit = (task) => {
//     setEditId(task._id);
//     setTitle(task.title);
//     setDescription(task.description || "");
//     setDueDate(task.dueDate ? task.dueDate.substring(0, 10) : "");
//     setAssignedTo(task.assignedTo?._id || "");
//     setShowPopup(true);
//   };

//   const getTaskBackgroundColor = (task) => {
//     if (task.status === "completed")
//       return theme === "dark" ? "#14532d" : "#dcfce7"; // Green
//     if (task.status === "in-progress")
//       return theme === "dark" ? "#713f12" : "#fef08a"; // Yellow

//     // Check if Pending AND Due Date is in the past (ignoring time of day)
//     if (task.status === "pending" && task.dueDate) {
//       const isOverdue = moment(task.dueDate).isBefore(moment(), "day");
//       if (isOverdue) return theme === "dark" ? "#7f1d1d" : "#fee2e2"; // Red
//     }

//     return theme === "dark" ? "#334155" : "#ffffff"; // Default based on theme
//   };

//   // const displayedTasks = tasks.filter((task) => {
//   //   if (viewFilter === "all") return true;
//   //   if (viewFilter === "toMe" && task.assignedTo?._id === user?.id) return true;
//   //   if (viewFilter === "byMe" && task.assignedBy?._id === user?.id) return true;
//   //   return false;
//   // });

//   let processedTasks = tasks.filter((task) => {
//     if (viewFilter === "toMe" && task.assignedTo?._id !== user?.id)
//       return false;
//     if (viewFilter === "byMe" && task.assignedBy?._id !== user?.id)
//       return false;

//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       const matchTitle = task.title.toLowerCase().includes(query);
//       const matchAssignee = (task.assignedTo?.email || "")
//         .toLowerCase()
//         .includes(query);
//       const matchAssigner = (task.assignedBy?.email || "")
//         .toLowerCase()
//         .includes(query);

//       if (!matchTitle && !matchAssignee && !matchAssigner) return false;
//     }

//     return true;
//   });

//   return (
//     <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
//       {user && (
//         <div style={{ marginBottom: "20px" }}>
//           <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>
//             Logged in as: <span style={{ color: "red" }}>({user.role})</span>
//           </p>
//           <strong style={{ fontSize: "16px" }}>{user.email}</strong>
//         </div>
//       )}

//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: "20px",
//         }}
//       >
//         <h2>Task Dashboard</h2>
//         <div style={{ display: "flex", gap: "10px" }}>
//           <button onClick={toggleTheme}>
//             {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
//           </button>
//           <button onClick={toggleViewMode}>
//             {viewMode === "card" ? "📋 Table View" : "🗂️ Card View"}
//           </button>
//           <button onClick={() => navigate("/hidden")}>Soft Deleted</button>
//           <button
//             onClick={() => {
//               localStorage.removeItem("mySecureToken");
//               navigate("/login");
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//       <div
//         style={{
//           display: "flex",
//           gap: "10px",
//           marginBottom: "20px",
//           flexWrap: "wrap",
//         }}
//       >
//         <button
//           onClick={() => setViewFilter("all")}
//           style={{ fontWeight: viewFilter === "all" ? "bold" : "normal" }}
//         >
//           All Tasks
//         </button>
//         <button
//           onClick={() => setViewFilter("toMe")}
//           style={{ fontWeight: viewFilter === "toMe" ? "bold" : "normal" }}
//         >
//           Assigned To Me
//         </button>
//         <button
//           onClick={() => setViewFilter("byMe")}
//           style={{ fontWeight: viewFilter === "byMe" ? "bold" : "normal" }}
//         >
//           Assigned By Me
//         </button>

//         <button
//           onClick={() => {
//             setEditId(null);
//             setTitle("");
//             setDescription("");
//             setDueDate("");
//             setAssignedTo("");
//             setShowPopup(true);
//           }}
//           style={{
//             marginLeft: "auto",
//             backgroundColor: "#22c55e",
//             color: "white",
//             fontWeight: "bold",
//           }}
//         >
//           + Add Task
//         </button>
//       </div>

//       <div
//         style={{
//           display: "flex",
//           gap: "10px",
//           marginBottom: "15px",
//           flexWrap: "wrap",
//         }}
//       >
//         <input
//           type="text"
//           placeholder="Search by task title or user email..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           style={{
//             flex: 1,
//             padding: "8px",
//             borderRadius: "4px",
//             border: "1px solid #ccc",
//             minWidth: "200px",
//           }}
//         />
//       </div>

//       <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
//         {processedTasks.length === 0 ? (
//           <p>No tasks found.</p>
//         ) : viewMode === "card" ? (
//           /* --- CARD VIEW --- */
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               gap: "15px",
//               marginTop: "20px",
//             }}
//           >
//             {processedTasks.map((task) => (
//               <div
//                 key={task._id}
//                 style={{
//                   padding: "15px",
//                   border: `1px solid ${theme === "dark" ? "#475569" : "#ccc"}`,
//                   borderRadius: "8px",
//                   backgroundColor: getTaskBackgroundColor(task), // Apply Moment.js color logic!
//                 }}
//               >
//                 <div
//                   style={{ display: "flex", justifyContent: "space-between" }}
//                 >
//                   <h3 style={{ margin: "0 0 10px 0" }}>{task.title}</h3>
//                   <span
//                     style={{
//                       fontWeight: "bold",
//                       padding: "4px 8px",
//                       borderRadius: "12px",
//                       background: "rgba(0,0,0,0.1)",
//                     }}
//                   >
//                     {task.status.toUpperCase()}
//                   </span>
//                 </div>
//                 <p>{task.description}</p>
//                 <div
//                   style={{
//                     display: "flex",
//                     gap: "20px",
//                     fontSize: "12px",
//                     paddingTop: "10px",
//                     borderTop: "1px solid rgba(0,0,0,0.1)",
//                   }}
//                 >
//                   <p>
//                     <strong>From:</strong> {task.assignedBy?.email || "Unknown"}
//                   </p>
//                   <p>
//                     <strong>To:</strong> {task.assignedTo?.email || "Unknown"}
//                   </p>
//                   <p>
//                     <strong>Due:</strong>{" "}
//                     {task.dueDate
//                       ? new Date(task.dueDate).toLocaleDateString()
//                       : "No Date"}
//                   </p>
//                 </div>
//                 <div
//                   style={{ display: "flex", gap: "10px", marginTop: "15px" }}
//                 >
//                   <button
//                     onClick={() => handleStatusChange(task._id, task.status)}
//                   >
//                     Change Status
//                   </button>
//                   {(user?.role === "admin" ||
//                     task.assignedBy?._id === user?.id) && (
//                     <>
//                       <button onClick={() => startEdit(task)}>Edit</button>
//                       <button onClick={() => handleSoftDelete(task._id)}>
//                         Soft Delete
//                       </button>
//                       <button onClick={() => handleHardDelete(task._id)}>
//                         Hard Delete
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           /* --- TABLE VIEW --- */
//           <table
//             style={{
//               width: "100%",
//               borderCollapse: "collapse",
//               marginTop: "20px",
//               textAlign: "left",
//             }}
//           >
//             <thead>
//               <tr
//                 style={{
//                   borderBottom: `2px solid ${theme === "dark" ? "#475569" : "#ccc"}`,
//                 }}
//               >
//                 <th style={{ padding: "10px" }}>Title</th>
//                 <th style={{ padding: "10px" }}>Assigned To</th>
//                 <th style={{ padding: "10px" }}>Due Date</th>
//                 <th style={{ padding: "10px" }}>Status</th>
//                 <th style={{ padding: "10px" }}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {processedTasks.map((task) => (
//                 <tr
//                   key={task._id}
//                   style={{
//                     borderBottom: `1px solid ${theme === "dark" ? "#475569" : "#eee"}`,
//                     backgroundColor: getTaskBackgroundColor(task), // Apply Moment.js color logic!
//                   }}
//                 >
//                   <td style={{ padding: "10px" }}>{task.title}</td>
//                   <td style={{ padding: "10px" }}>
//                     {task.assignedTo?.email || "Unknown"}
//                   </td>
//                   <td style={{ padding: "10px" }}>
//                     {task.dueDate
//                       ? new Date(task.dueDate).toLocaleDateString()
//                       : "No Date"}
//                   </td>
//                   <td style={{ padding: "10px", fontWeight: "bold" }}>
//                     {task.status.toUpperCase()}
//                   </td>
//                   <td style={{ padding: "10px", display: "flex", gap: "5px" }}>
//                     <button
//                       onClick={() => handleStatusChange(task._id, task.status)}
//                     >
//                       Status
//                     </button>
//                     {(user?.role === "admin" ||
//                       task.assignedBy?._id === user?.id) && (
//                       <button onClick={() => startEdit(task)}>Edit</button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {showPopup && (
//         <div style={modalOverlayStyle}>
//           <div style={modalContentStyle}>
//             <h3>{editId ? "Update Task" : "Create New Task"}</h3>

//             <form
//               onSubmit={handleSubmit}
//               style={{ display: "flex", flexDirection: "column", gap: "15px" }}
//             >
//               <input
//                 type="text"
//                 placeholder="Title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 required
//                 style={inputStyle}
//               />

//               <textarea
//                 placeholder="Description"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 style={{ ...inputStyle, minHeight: "80px" }}
//               />

//               <div>
//                 <label
//                   style={{ fontSize: "12px", color: "gray", display: "block" }}
//                 >
//                   Due Date
//                 </label>
//                 <input
//                   type="date"
//                   value={dueDate}
//                   onChange={(e) => setDueDate(e.target.value)}
//                   required
//                   style={inputStyle}
//                 />
//               </div>

//               <div>
//                 <label
//                   style={{ fontSize: "12px", color: "gray", display: "block" }}
//                 >
//                   Assign To
//                 </label>
//                 <select
//                   value={assignedTo}
//                   onChange={(e) => setAssignedTo(e.target.value)}
//                   required
//                   style={inputStyle}
//                 >
//                   <option value="" disabled>
//                     Select a user...
//                   </option>
//                   {usersList.map((u) => (
//                     <option key={u._id} value={u._id}>
//                       {u.email}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
//                 <button
//                   type="submit"
//                   style={{
//                     flex: 1,
//                     backgroundColor: "#3b82f6",
//                     color: "white",
//                   }}
//                 >
//                   {editId ? "Update Task" : "Submit Task"}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setShowPopup(false)}
//                   style={{
//                     flex: 1,
//                     backgroundColor: "#ef4444",
//                     color: "white",
//                   }}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// const modalOverlayStyle = {
//   position: "fixed",
//   top: 0,
//   left: 0,
//   right: 0,
//   bottom: 0,
//   backgroundColor: "rgba(0,0,0,0.6)",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   zIndex: 1000,
// };

// const modalContentStyle = {
//   backgroundColor: "white",
//   padding: "30px",
//   borderRadius: "8px",
//   width: "100%",
//   maxWidth: "400px",
// };

// const inputStyle = {
//   padding: "10px",
//   border: "1px solid #ccc",
//   borderRadius: "4px",
//   width: "100%",
//   boxSizing: "border-box",
// };

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";

// export default function Dashboard() {
//   const [tasks, setTasks] = useState([]);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [editId, setEditId] = useState(null);
//   const [user, setuser] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("mySecureToken");
//     if (!token) {
//       navigate("/login");
//     } else {
//       fetchTasks();
//     }
//   }, [navigate]);

//   const fetchTasks = async () => {
//     const token = localStorage.getItem("mySecureToken");
//     try {
//       const res = await axios.get("http://localhost:8080/task/all", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setTasks(res.data);
//     } catch (error) {
//       if (error.response?.status === 401) navigate("/login");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const token = localStorage.getItem("mySecureToken");
//     try {
//       if (editId) {
//         await axios.put(
//           `http://localhost:8080/task/update/${editId}`,
//           { title, description },
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );
//         setEditId(null);
//       } else {
//         await axios.post(
//           "http://localhost:8080/task/add",
//           { title, description },
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );
//       }
//       setTitle("");
//       setDescription("");
//       fetchTasks();
//     } catch (error) {
//       console.error("Action failed", error);
//     }
//   };

//   const handleStatusChange = async (id, currentStatus) => {
//     const token = localStorage.getItem("mySecureToken");
//     const statuses = ["pending", "in-progress", "completed"];
//     const nextStatus =
//       statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

//     try {
//       await axios.put(
//         `http://localhost:8080/task/update/${id}`,
//         { status: nextStatus },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       fetchTasks();
//     } catch (error) {
//       console.error("Status update failed", error);
//     }
//   };

//   const handleSoftDelete = async (id) => {
//     const token = localStorage.getItem("mySecureToken");

//     try {
//       await axios.patch(
//         `http://localhost:8080/task/softdelete/${id}`,
//         { isDeleted: true },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );
//       fetchTasks();
//     } catch (error) {
//       console.error(
//         "Soft deletion failed",
//         error.response?.data || error.message,
//       );
//     }
//   };

//   const handleHardDelete = async (id) => {
//     const token = localStorage.getItem("mySecureToken");
//     const config = {
//       headers: { Authorization: `Bearer ${token}` },
//     };

//     try {
//       await axios.delete(
//         `http://localhost:8080/task/hard-delete/${id}`,
//         config,
//       );
//       fetchTasks();
//     } catch (error) {
//       console.error("Hard deletion failed", error);
//     }
//   };

//   const startEdit = (task) => {
//     setEditId(task._id);
//     setTitle(task.title);
//     setDescription(task.description || "");
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("mySecureToken");

//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         setuser(decoded);
//       } catch (error) {
//         console.error("Invalid token format:", error);
//       }
//     }
//   }, []);

//   return (
//     <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
//       {user && (
//         <div>
//           <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>
//             Logged in as:
//           </p>
//           <strong style={{ fontSize: "16px" }}>{user.email}</strong>
//         </div>
//       )}

//       <div style={{ display: "flex", justifyContent: "space-between" }}>
//         <h2>Task Dashboard</h2>
//         <button
//           onClick={() => {
//             localStorage.removeItem("mySecureToken");
//             navigate("/login");
//           }}
//         >
//           Logout
//         </button>
//         <button
//           onClick={() => {
//             navigate("/hidden");
//           }}
//         >
//           Soft Deleted
//         </button>
//       </div>

//       <form
//         onSubmit={handleSubmit}
//         style={{ display: "flex", gap: "10px", margin: "20px 0" }}
//       >
//         <input
//           type="text"
//           placeholder="Title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           required
//         />
//         <input
//           type="text"
//           placeholder="Description"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//         />
//         <button type="submit">{editId ? "Update Task" : "Add Task"}</button>
//         {editId && (
//           <button
//             type="button"
//             onClick={() => {
//               setEditId(null);
//               setTitle("");
//               setDescription("");
//             }}
//           >
//             Cancel
//           </button>
//         )}
//       </form>

//       <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
//         {tasks.map((task) => (
//           <div
//             key={task._id}
//             style={{
//               padding: "15px",
//               border: "1px solid #ccc",
//               borderRadius: "8px",
//             }}
//           >
//             <h3>{task.title}</h3>
//             <p>{task.description}</p>
//             {task.user?.email && (
//               <p style={{ fontSize: "12px", color: "blue" }}>
//                 Owner: {task.user.email}
//               </p>
//             )}

//             <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
//               <button onClick={() => handleStatusChange(task._id, task.status)}>
//                 Status: {task.status.toUpperCase()} (Click to change)
//               </button>
//               <button onClick={() => startEdit(task)}>Edit</button>
//               <button onClick={() => handleSoftDelete(task._id, true)}>
//                 Soft Delete
//               </button>
//               <button onClick={() => handleHardDelete(task._id, false)}>
//                 Hard Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
