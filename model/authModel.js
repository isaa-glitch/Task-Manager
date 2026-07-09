const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: false, default: "user" },
  theme: { type: String, enum: ["light", "dark"], default: "light" },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
});

module.exports = mongoose.model("AuthUsers", authSchema);
