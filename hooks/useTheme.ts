
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('papersnap_theme');
    // Default to light mode (false) if no saved theme, ignoring system preference as requested
    if (!savedTheme) {
      return false; 
    }
    return savedTheme === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('papersnap_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('papersnap_theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return { darkMode, toggleTheme };
};
