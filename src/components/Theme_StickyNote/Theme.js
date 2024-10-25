import React, { useState, useEffect } from "react";

function App() {
  // State to hold the theme, default is light
  const [theme, setTheme] = useState("light");

  // Function to toggle between dark and light themes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Apply theme to the body on mount and when theme changes
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <div>
      <button onClick={toggleTheme}>
        Switch to {theme === "light" ? "Dark" : "Light"} Theme
      </button>
      <h1>Hello, welcome to theme switching!</h1>
    </div>
  );

}

export default App;