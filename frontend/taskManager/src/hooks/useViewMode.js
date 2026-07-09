import { useState } from "react";

export function useViewMode(initialMode = "card") {
  const [viewMode, setViewMode] = useState(initialMode);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "card" ? "table" : "card"));
  };

  return { viewMode, toggleViewMode };
}
