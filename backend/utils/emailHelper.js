const nodemailer = require("nodemailer");
const cron = require("node-cron");
const Task = require("../model/taskModel"); 
const User = require("../model/authModel"); 

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.usermail,
    pass: process.env.userpassword,
  },
});


const sendTaskEmail = async (email, taskName, taskText) => {
  try {
    await transport.sendMail({
      from: process.env.usermail,
      to: email,
      subject: taskName,
      text: taskText,
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Email failed to send, but task was created.", error.message);
  }
};

const startAdminReportCron = () => {
  cron.schedule(
    "0 0 * * * ",
    async () => {
      console.log("🕛 Running Midnight Cron Job: Fetching pending tasks...");

      try {
        const admins = await User.find({ role: "admin" });
        console.log(`adminsss`, admins)
        if (admins.length === 0)
          return console.log("No admins found to email.");
        const adminEmails = admins.map((admin) => admin.email).join(",");

        const pendingTasks = await Task.find({
          status: "pending",
          isDeleted: false,
        }).populate("assignedTo", "email name");

        if (pendingTasks.length === 0)
          return console.log("No pending tasks to report.");

        let emailHtml = `
        <h2 style="color: #333;">Daily Pending Tasks Report</h2>
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <tr style="background-color: #f3f4f6;">
            <th>Task Title</th>
            <th>Due Date</th>
            <th>Assigned To</th>
          </tr>
      `;

        pendingTasks.forEach((task) => {
          const dueDate = task.dueDate
            ? new Date(task.dueDate).toLocaleDateString()
            : "No Date";
          const assignee = task.assignedTo
            ? task.assignedTo.email
            : "Unassigned";
          emailHtml += `<tr><td><strong>${task.title}</strong></td><td>${dueDate}</td><td>${assignee}</td></tr>`;
        });

        emailHtml += `</table><p>Sent automatically from Task Manager.</p>`;

        await transport.sendMail({
          from: process.env.usermail,
          to: adminEmails,
          subject: `🚨 Pending Tasks Report - ${new Date().toLocaleDateString()}`,
          html: emailHtml,
        });

        console.log(`✅ Success: Daily report sent to admins (${adminEmails})`);
      } catch (error) {
        console.error("❌ Cron Job Failed:", error);
      }
    },
    {
      timezone: "Asia/Kolkata"
    },
  );
};

module.exports = { sendTaskEmail, startAdminReportCron };
