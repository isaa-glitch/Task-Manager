const { jsPDF } = require("jspdf");

exports.pdf = (task) => {
  const doc = new jsPDF();
  let y = 20;


  doc.setFontSize(18);
  doc.text("Task Details", 10, y);
  y += 15;

  doc.setFontSize(12);

  doc.text(`Title: ${task.title || "N/A"}`, 10, y);
  y += 10;

  doc.text(`Description: ${task.description || "N/A"}`, 10, y);
  y += 10;

  const dateStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : "No Date";
  doc.text(`Due Date: ${dateStr}`, 10, y);
  y += 10;

  doc.text(`Status: ${task.status ? task.status.toUpperCase() : "N/A"}`, 10, y);
  y += 10;

  doc.text(`Assigned To: ${task.assignedTo?.email || "Unknown"}`, 10, y);

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  return pdfBuffer;
};
