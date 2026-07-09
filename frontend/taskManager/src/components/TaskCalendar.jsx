import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import moment from "moment";

export default function TaskCalendar({ tasks, user }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const calendarTasks = tasks.filter((task) => {
    if (user?.role === "admin") return true;

    const isAssignedToMe = task.assignedTo?._id === user?.id;
    const isAssignedByMe = task.assignedBy?._id === user?.id;

    return isAssignedToMe || isAssignedByMe;
  });


  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const hasTask = calendarTasks.find(
        (task) => task.dueDate && moment(task.dueDate).isSame(date, "day"),
      );

      if (hasTask) {
        return (
          <div
            style={{
              height: "8px",
              width: "8px",
              backgroundColor: "#ef4444",
              borderRadius: "50%",
              margin: "auto",
              marginTop: "2px",
            }}
          />
        );
      }
    }
    return null;
  };

  const tasksForSelectedDate = calendarTasks.filter(
    (task) => task.dueDate && moment(task.dueDate).isSame(selectedDate, "day"),
  );

  return (
    <div
      style={{
        display: "flex",
        gap: "30px",
        marginTop: "20px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "1", minWidth: "300px" }}>
        <h3>Task Calendar</h3>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
          style={{ width: "100%", border: "none", borderRadius: "8px" }}
        />
      </div>

      <div
        style={{
          flex: "1",
          minWidth: "300px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h3>Tasks Due on {moment(selectedDate).format("MMMM Do, YYYY")}</h3>

        {tasksForSelectedDate.length === 0 ? (
          <p style={{ color: "gray" }}>No tasks due on this date.</p>
        ) : (
          <ul style={{ paddingLeft: "20px" }}>
            {tasksForSelectedDate.map((task) => (
              <li key={task._id} style={{ marginBottom: "10px" }}>
                <strong>{task.title}</strong>
                <span
                  style={{
                    marginLeft: "10px",
                    fontSize: "12px",
                    color: task.status === "completed" ? "green" : "orange",
                  }}
                >
                  ({task.status})
                </span>
                <p style={{ margin: "4px 0", fontSize: "14px", color: "#555" }}>
                  To: {task.assignedTo?.email || "Unknown"} | From:{" "}
                  {task.assignedBy?.email || "Unknown"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
