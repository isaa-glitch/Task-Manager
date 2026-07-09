import React from "react";
import axios from "axios";

// Notice we accept a single 'task' object now
export default function PdfDownload({ task }) {
  const token = localStorage.getItem("mySecureToken");

  const handlePdf = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/task/taskpdf",
        { task: task }, // Send the specific task to the backend
        {
          // Combine headers and responseType into ONE config object
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      // Pro-tip: Name the file dynamically based on the task title!
      a.download = `${task.title.replace(/\s+/g, "_")}_details.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Download failed", err);
    }
  };

  return (
    <button
      onClick={handlePdf}
      title="Download Task PDF"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "5px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.2s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {/* A clean, professional SVG logo for the PDF */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <line x1="9" y1="15" x2="15" y2="15"></line>
      </svg>
    </button>
  );
}
