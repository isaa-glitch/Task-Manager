import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  // State for the multi-step form
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Reset Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Step 1: Ask backend to generate and email the OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await axios.post(
        "http://localhost:8080/authuser/forgetPassword",
        { email },
      );
      setMessage(res.data.message);
      setStep(2); // Move to the next screen!
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    }
  };

  // Step 2: Send OTP and new password to backend for verification
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      const res = await axios.post(
        "http://localhost:8080/authuser/resetPassword",
        {
          email,
          otp,
          newPassword,
          confirmPassword,
        },
      );

      alert(res.data.message);
      navigate("/login"); // Send them back to login on success
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div style={{ padding: "50px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Reset Password</h2>

      {message && (
        <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>
      )}
      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      {step === 1 ? (
        // --- STEP 1 UI: GET EMAIL ---
        <form
          onSubmit={handleRequestOTP}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <p style={{ color: "gray", fontSize: "14px" }}>
            Enter your email address and we will send you a 6-digit OTP to reset
            your password.
          </p>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            Send OTP
          </button>
        </form>
      ) : (
        // --- STEP 2 UI: ENTER OTP & NEW PASSWORD ---
        <form
          onSubmit={handleResetPassword}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <p style={{ color: "gray", fontSize: "14px" }}>
            OTP sent to <strong>{email}</strong>. Check your inbox and spam
            folder.
          </p>
          <input
            type="text"
            placeholder="6-Digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            Reset Password
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            style={{
              ...buttonStyle,
              backgroundColor: "#64748b",
              marginTop: "10px",
            }}
          >
            Wrong email? Go back
          </button>
        </form>
      )}

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
}

// Simple styling objects
const inputStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
};
const buttonStyle = {
  padding: "10px",
  backgroundColor: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold",
};
