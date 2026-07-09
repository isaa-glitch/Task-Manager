import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../utils/firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function GoogleButton() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      // 1. Open the Google Popup
      const result = await signInWithPopup(auth, googleProvider);

      // 2. Grab the user's info from Firebase
      const user = result.user
      const token = user.getIdToken()
      console.log(result);
      
      // 3. Send that info to your Custom Node.js Backend Bridge
      const res = await axios.post("http://localhost:8080/authuser/google", {
        email: user.email,
        name: user.displayName
      },{
        headers:{
          Authorization: `Bearer ${token}`
        }
      });
   console.log(res);
   
      // 4. Save YOUR custom backend JWT (not Firebase's token)
      localStorage.setItem("mySecureToken", res.data.token);

      // 5. Send them to the dashboard!
      navigate("/dashboard");
    } catch (err) {
      console.error("Auth Error:", err);
      // Firebase throws 'auth/popup-closed-by-user' if they close the window early
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Failed to authenticate. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "15px",
      }}
    >
      {error && (
        <p style={{ color: "red", fontSize: "12px", fontWeight: "bold" }}>
          {error}
        </p>
      )}

      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          width: "100%",
          padding: "10px",
          backgroundColor: "#fff",
          color: "#333",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: isLoading ? "not-allowed" : "pointer",
          fontWeight: "bold",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {isLoading ? "Signing in..." : "Continue with Google"}
      </button>
    </div>
  );
}
