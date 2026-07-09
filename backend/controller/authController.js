const authModel = require("../Model/authModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendTaskEmail } = require("../utils/emailHelper"); 
const {uploadImage} = require("../utils/cloudinary")
const os = require("os");
const OsLoginInfo = require("../Model/osModel");

const secretKey = "my_super_secret_key_123";

exports.signup = async (req, res) => {
  console.log(`req.body`, req.body)
  console.log(`req.files`, req.files)
  const uploadData = await uploadImage(req.files)
  return;
  try {
    const { email, password } = req.body;
    const existingUser = await authModel.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists! Please login instead." });
    }
    const salt = 10;
    const hash = await bcrypt.hash(password, salt);

    req.body.password = hash;
    const result = await authModel.create(req.body);

    sendTaskEmail(
      email,
      "Welcome to Task Manager!",
      "Your account has been successfully created. You can now log in and start managing your tasks.",
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authModel.findOne({ email: email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    if (user.isActive === false)
      return res.status(403).json({ message: "Account is disabled." });

    const totalGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const cpuModel = os.cpus()[0].model;
    await OsLoginInfo.create({
      userEmail: user.email,
      hostname: os.hostname(),
      platform: os.platform(),
      architecture: os.arch(),
      cpuModel: cpuModel,
      totalMemoryGB: totalGB,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, theme: user.theme },
      secretKey,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Login successful!",
      token: token,
      role: user.role,
      theme: user.theme,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await authModel.findOne({ email: email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    sendTaskEmail(
      user.email,
      "Password Reset Code",
      `Your password reset code is: ${otp}\n\nThis code is valid for 10 minutes. If you did not request this, please ignore this email.`,
    );

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const user = await authModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP code." });
    }
    if (user.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }
    user.password = await bcrypt.hash(newPassword, 10);

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res
      .status(200)
      .json({ message: "Password updated successfully! You can now log in." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await authModel.find().select("_id email");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    const user = await authModel.findByIdAndUpdate(
      req.user.id,
      { theme },
      { new: true },
    );
    res.status(200).json({ message: "Theme updated", theme: user.theme });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match." });
    }

    const user = await authModel.findById(req.user.id); 
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password successfully updated!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.googleAuth = async (req, res) => {
  try {
    const { email, name } = req.body;

    let user = await authModel.findOne({ email: email });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await authModel.create({
        email: email,
        password: hashedPassword,
        role: "user", 
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is disabled." });
    }

    const totalGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const cpuModel = os.cpus()[0].model;
    await OsLoginInfo.create({
      userEmail: user.email,
      hostname: os.hostname(),
      platform: os.platform(),
      architecture: os.arch(),
      cpuModel: cpuModel,
      totalMemoryGB: totalGB,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, theme: user.theme },
      secretKey,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Google Login successful!",
      token: token,
      role: user.role,
      theme: user.theme
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.getOsLogins = async (req, res) => {
  try {
    // req.user.email comes from your JWT middleware
    const history = await OsLoginInfo.find({ userEmail: req.user.email })
      .sort({ loginTime: -1 }) // Newest first
      .limit(5); // Show last 5 logins

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};