import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import GoogleButton from "./GoogleButton";

export default function AuthPage({ isLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:8080/authuser/login", {
          email,
          password,
        });
        localStorage.setItem("mySecureToken", res.data.token);
        localStorage.setItem("theme", res.data.theme || "light");
        console.log(res.data.token);
        
        navigate("/dashboard");
      } else {
        await axios.post("http://localhost:8080/authuser/signup", {
          email,
          password,
        });
        navigate("/login");
      }
    } catch (err) {
      alert(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div style={{ padding: "50px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button type="submit">{isLogin ? "Log In" : "Sign Up"}</button>
        <GoogleButton />
      </form>
      <p style={{ marginTop: "20px" }}>
        <Link to={isLogin ? "/signup" : "/login"}>
          {isLogin ? "Go to Sign Up" : "Go to Login"}
        </Link>
        <br />
        <br />
        <Link to="/reset-password">Forgot Password?</Link>
      </p>
    </div>
  );
}
