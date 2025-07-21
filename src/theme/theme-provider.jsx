import React, { createContext, useContext, useState, useEffect } from "react";

// Create context
const ThemeContext = createContext();

// Define provider component
export function ThemeProvider({ children }) {
  const [colorScheme, setColorScheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("colorScheme") || "light";
    setColorScheme(saved);
  }, []);

  useEffect(() => {
    if (!colorScheme) return;
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(colorScheme);
    localStorage.setItem("colorScheme", colorScheme);
  }, [colorScheme]);

  const toggleColorScheme = () => {
    setColorScheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}


// Hook
export function useThemeColor() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeColor must be used within a ThemeProvider");
  }
  return context;
}
