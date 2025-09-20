import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        p-2 rounded-lg transition-all duration-300 ease-in-out
        ${darkMode 
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 hover:text-yellow-300' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
        }
        focus:outline-none focus:ring-2 focus:ring-offset-2 
        ${darkMode ? 'focus:ring-yellow-400' : 'focus:ring-blue-500'}
        transform hover:scale-105 active:scale-95
      `}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        <SunIcon 
          className={`
            absolute inset-0 transition-all duration-300 ease-in-out
            ${darkMode 
              ? 'opacity-0 scale-0 rotate-180' 
              : 'opacity-100 scale-100 rotate-0'
            }
          `}
        />
        <MoonIcon 
          className={`
            absolute inset-0 transition-all duration-300 ease-in-out
            ${darkMode 
              ? 'opacity-100 scale-100 rotate-0' 
              : 'opacity-0 scale-0 -rotate-180'
            }
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
