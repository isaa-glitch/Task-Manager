const mongoose = require("mongoose");

const osSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  hostname: String,
  platform: String,
  architecture: String,
  cpuModel: String,
  totalMemoryGB: String,
  loginTime: { type: Date, default: Date.now },
});

module.exports = mongoose.model("OsLoginInfo", osSchema);
