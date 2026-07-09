import { useState, useEffect } from "react";
import axios from "axios";

export function useTheme(defaultTheme = "light") {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || defaultTheme
  );

  const toggleTheme = async() => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next)
    const token = localStorage.getItem("mySecureToken");
    if (token) {
      try {
        await axios.put(
          "http://localhost:8080/authuser/theme",
          { theme: next },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        localStorage.setItem("theme", next);
      } catch (error) {
        console.error(
          "Database theme update failed:",
          error.response?.data || error.message,
        );
      }
    }
  };

  return { theme, toggleTheme };
}

