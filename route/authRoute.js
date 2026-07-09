const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const authController = require("../controller/authController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgetPassword", authController.forgetPassword);
router.post("/resetPassword", authController.resetPassword);
router.get("/users", auth, authController.getAllUsers);
router.put("/theme", auth, authController.updateTheme);
router.put("/changePassword",auth, authController.changePassword);
router.post("/google", authController.googleAuth);
router.get("/os-logins", auth, authController.getOsLogins);

module.exports = router;
