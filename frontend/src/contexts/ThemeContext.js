import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('packing-tracker-theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('packing-tracker-theme', darkMode ? 'dark' : 'light');
    
    // Update document class for Tailwind dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const theme = {
    darkMode,
    toggleDarkMode,
    colors: {
      // Background colors
      bg: {
        primary: darkMode ? 'bg-gray-900' : 'bg-gray-50',
        secondary: darkMode ? 'bg-gray-800' : 'bg-white',
        card: darkMode ? 'bg-gray-800' : 'bg-white',
        hover: darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
        active: darkMode ? 'bg-gray-700' : 'bg-gray-100'
      },
      // Text colors
      text: {
        primary: darkMode ? 'text-gray-100' : 'text-gray-900',
        secondary: darkMode ? 'text-gray-300' : 'text-gray-600',
        muted: darkMode ? 'text-gray-400' : 'text-gray-500',
        inverse: darkMode ? 'text-gray-900' : 'text-gray-100'
      },
      // Border colors
      border: {
        primary: darkMode ? 'border-gray-700' : 'border-gray-200',
        secondary: darkMode ? 'border-gray-600' : 'border-gray-300',
        focus: darkMode ? 'border-blue-400' : 'border-blue-500'
      },
      // Status colors
      success: {
        bg: darkMode ? 'bg-green-900/50' : 'bg-green-50',
        text: darkMode ? 'text-green-400' : 'text-green-600',
        border: darkMode ? 'border-green-800' : 'border-green-200',
        button: darkMode ? 'bg-green-800 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'
      },
      warning: {
        bg: darkMode ? 'bg-yellow-900/50' : 'bg-yellow-50',
        text: darkMode ? 'text-yellow-400' : 'text-yellow-600',
        border: darkMode ? 'border-yellow-800' : 'border-yellow-200'
      },
      error: {
        bg: darkMode ? 'bg-red-900/50' : 'bg-red-50',
        text: darkMode ? 'text-red-400' : 'text-red-600',
        border: darkMode ? 'border-red-800' : 'border-red-200'
      },
      primary: {
        bg: darkMode ? 'bg-blue-900/50' : 'bg-blue-50',
        text: darkMode ? 'text-blue-400' : 'text-blue-600',
        border: darkMode ? 'border-blue-800' : 'border-blue-200',
        button: darkMode ? 'bg-blue-800 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
      }
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
