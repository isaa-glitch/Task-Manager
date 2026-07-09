require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const e = require("express");
const fileUpload = require("express-fileupload")
const cloudinary = require("cloudinary").v2;
const { startAdminReportCron } = require("./utils/emailHelper");

startAdminReportCron();
// const os = require("os");

// console.log(os.platform());
// console.log(os.arch());
// console.log(os.hostname());
// console.log(os.release());
// console.log(os.cpus());
// console.log(os.totalmem());
// console.log(os.freemem());
// console.log(os.userInfo());
// console.log(os.homedir());
// console.log(os.uptime());

// const os = require("os");

// console.log("=== SYSTEM DIAGNOSTICS ===");

// // 1. Core System Identity
// console.log(`Hostname: ${os.hostname()}`);
// console.log(`OS Platform: ${os.platform()}`);
// console.log(`OS Release Version: ${os.release()}`);
// console.log(`Architecture: ${os.arch()}`);

// // 2. Hardware Specs
// const coreCount = os.cpus().length;
// const cpuModel = os.cpus()[0].model; // Grabbing the name of the first core
// console.log(`CPU: ${cpuModel} (${coreCount} cores)`);

// // Converting Bytes to Gigabytes for readability
// const totalGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
// const freeGB = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
// console.log(`RAM: ${freeGB} GB free out of ${totalGB} GB total`);

// // 3. User & Environment
// console.log(`Current User: ${os.userInfo().username}`);
// console.log(`Home Directory: ${os.homedir()}`);

// // 4. Server Uptime
// // Converting seconds into hours for readability
// const uptimeHours = (os.uptime() / 3600).toFixed(2);
// console.log(`System Uptime: ${uptimeHours} hours`);


// const cron = require("node-cron");
// cron.schedule("* * * * * *", () => {
//   console.log("Testing: This prints every single second.");
// });



const app = express();
app.use(cors());
app.use(express.json());
app.use(
  fileUpload(),
);
app.use(express.urlencoded({ extended: true }));

const port = 8080;

const url = "mongodb://localhost:27017/reactS";
mongoose.connect(url).then(() => console.log("Database connected succefully"));

// app.use("/", );

const authRouter = require("./route/authRoute");
app.use("/authuser", authRouter);

const taskRouter = require("./route/taskRoute");
app.use("/task", taskRouter);

app.listen(port, () => {
  console.log(`server is runnig on port>>>>>>${port}`);
});
