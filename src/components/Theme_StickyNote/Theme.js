import React, { useState } from 'react';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);

    if (!isDarkMode) {
      // Dark theme
      document.documentElement.style.setProperty('--white', '#000');
      document.documentElement.style.setProperty('--black', '#fff');
      document.documentElement.style.setProperty('--maincolordark', '#1b3076');
      document.documentElement.style.setProperty('--accentcolor', '#ffabdb');
    } else {
      // Light theme
      document.documentElement.style.setProperty('--white', '#fff');
      document.documentElement.style.setProperty('--black', '#000');
      document.documentElement.style.setProperty('--maincolordark', '#07021c');
      document.documentElement.style.setProperty('--accentcolor', '#dbabff');
    }
  };

  return (
    <a onClick={toggleTheme}>
      {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    </a>
  );
};

export default ThemeToggle;
