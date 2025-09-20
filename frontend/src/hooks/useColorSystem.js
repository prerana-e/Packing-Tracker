import { useTheme } from '../contexts/ThemeContext';

export const useColorSystem = () => {
  const { darkMode } = useTheme();

  const getProgressColor = (packedCount, totalCount) => {
    if (totalCount === 0) return 'gray';
    
    const percentage = (packedCount / totalCount) * 100;
    
    if (percentage === 100) return 'green';
    if (percentage >= 75) return 'blue';
    if (percentage >= 50) return 'yellow';
    if (percentage >= 25) return 'orange';
    return 'red';
  };

  const getCategoryColors = (category) => {
    const colorMap = {
      electronics: {
        bg: darkMode ? 'bg-blue-900/30' : 'bg-blue-50',
        border: darkMode ? 'border-blue-700' : 'border-blue-200',
        text: darkMode ? 'text-blue-400' : 'text-blue-700',
        accent: darkMode ? 'bg-blue-800' : 'bg-blue-100',
        gradient: 'from-blue-500 to-purple-600'
      },
      clothes: {
        bg: darkMode ? 'bg-pink-900/30' : 'bg-pink-50',
        border: darkMode ? 'border-pink-700' : 'border-pink-200',
        text: darkMode ? 'text-pink-400' : 'text-pink-700',
        accent: darkMode ? 'bg-pink-800' : 'bg-pink-100',
        gradient: 'from-pink-500 to-rose-600'
      },
      documents: {
        bg: darkMode ? 'bg-green-900/30' : 'bg-green-50',
        border: darkMode ? 'border-green-700' : 'border-green-200',
        text: darkMode ? 'text-green-400' : 'text-green-700',
        accent: darkMode ? 'bg-green-800' : 'bg-green-100',
        gradient: 'from-green-500 to-emerald-600'
      },
      books: {
        bg: darkMode ? 'bg-purple-900/30' : 'bg-purple-50',
        border: darkMode ? 'border-purple-700' : 'border-purple-200',
        text: darkMode ? 'text-purple-400' : 'text-purple-700',
        accent: darkMode ? 'bg-purple-800' : 'bg-purple-100',
        gradient: 'from-purple-500 to-indigo-600'
      },
      kitchenware: {
        bg: darkMode ? 'bg-orange-900/30' : 'bg-orange-50',
        border: darkMode ? 'border-orange-700' : 'border-orange-200',
        text: darkMode ? 'text-orange-400' : 'text-orange-700',
        accent: darkMode ? 'bg-orange-800' : 'bg-orange-100',
        gradient: 'from-orange-500 to-red-600'
      },
      toiletries: {
        bg: darkMode ? 'bg-cyan-900/30' : 'bg-cyan-50',
        border: darkMode ? 'border-cyan-700' : 'border-cyan-200',
        text: darkMode ? 'text-cyan-400' : 'text-cyan-700',
        accent: darkMode ? 'bg-cyan-800' : 'bg-cyan-100',
        gradient: 'from-cyan-500 to-teal-600'
      },
      bedding: {
        bg: darkMode ? 'bg-indigo-900/30' : 'bg-indigo-50',
        border: darkMode ? 'border-indigo-700' : 'border-indigo-200',
        text: darkMode ? 'text-indigo-400' : 'text-indigo-700',
        accent: darkMode ? 'bg-indigo-800' : 'bg-indigo-100',
        gradient: 'from-indigo-500 to-blue-600'
      },
      sports: {
        bg: darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50',
        border: darkMode ? 'border-emerald-700' : 'border-emerald-200',
        text: darkMode ? 'text-emerald-400' : 'text-emerald-700',
        accent: darkMode ? 'bg-emerald-800' : 'bg-emerald-100',
        gradient: 'from-emerald-500 to-green-600'
      },
      travel: {
        bg: darkMode ? 'bg-amber-900/30' : 'bg-amber-50',
        border: darkMode ? 'border-amber-700' : 'border-amber-200',
        text: darkMode ? 'text-amber-400' : 'text-amber-700',
        accent: darkMode ? 'bg-amber-800' : 'bg-amber-100',
        gradient: 'from-amber-500 to-yellow-600'
      },
      medical: {
        bg: darkMode ? 'bg-red-900/30' : 'bg-red-50',
        border: darkMode ? 'border-red-700' : 'border-red-200',
        text: darkMode ? 'text-red-400' : 'text-red-700',
        accent: darkMode ? 'bg-red-800' : 'bg-red-100',
        gradient: 'from-red-500 to-pink-600'
      }
    };

    return colorMap[category.toLowerCase()] || {
      bg: darkMode ? 'bg-gray-900/30' : 'bg-gray-50',
      border: darkMode ? 'border-gray-700' : 'border-gray-200',
      text: darkMode ? 'text-gray-400' : 'text-gray-700',
      accent: darkMode ? 'bg-gray-800' : 'bg-gray-100',
      gradient: 'from-gray-500 to-slate-600'
    };
  };

  const getPriorityColors = (priority = 'medium') => {
    const priorityMap = {
      high: {
        bg: darkMode ? 'bg-red-900/30' : 'bg-red-50',
        border: darkMode ? 'border-red-700' : 'border-red-200',
        text: darkMode ? 'text-red-400' : 'text-red-700',
        indicator: darkMode ? 'bg-red-600' : 'bg-red-500',
        pulse: 'animate-pulse-glow'
      },
      medium: {
        bg: darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50',
        border: darkMode ? 'border-yellow-700' : 'border-yellow-200',
        text: darkMode ? 'text-yellow-400' : 'text-yellow-700',
        indicator: darkMode ? 'bg-yellow-600' : 'bg-yellow-500'
      },
      low: {
        bg: darkMode ? 'bg-green-900/30' : 'bg-green-50',
        border: darkMode ? 'border-green-700' : 'border-green-200',
        text: darkMode ? 'text-green-400' : 'text-green-700',
        indicator: darkMode ? 'bg-green-600' : 'bg-green-500'
      }
    };

    return priorityMap[priority] || priorityMap.medium;
  };

  const getStatusColors = (status, category) => {
    const categoryColors = getCategoryColors(category);
    
    if (status === 'packed') {
      return {
        bg: darkMode ? 'bg-green-900/50' : 'bg-green-50',
        border: darkMode ? 'border-green-600' : 'border-green-300',
        text: darkMode ? 'text-green-400' : 'text-green-700',
        accent: darkMode ? 'bg-green-700' : 'bg-green-200',
        glow: 'shadow-green-500/20'
      };
    }

    return {
      bg: categoryColors.bg,
      border: categoryColors.border,
      text: categoryColors.text,
      accent: categoryColors.accent,
      glow: 'shadow-gray-500/10'
    };
  };

  const getProgressBarColors = (percentage) => {
    if (percentage === 100) {
      return {
        bg: darkMode ? 'bg-green-600' : 'bg-green-500',
        glow: 'shadow-lg shadow-green-500/50',
        gradient: 'bg-gradient-to-r from-green-500 to-emerald-600'
      };
    }
    if (percentage >= 75) {
      return {
        bg: darkMode ? 'bg-blue-600' : 'bg-blue-500',
        glow: 'shadow-lg shadow-blue-500/50',
        gradient: 'bg-gradient-to-r from-blue-500 to-indigo-600'
      };
    }
    if (percentage >= 50) {
      return {
        bg: darkMode ? 'bg-yellow-600' : 'bg-yellow-500',
        glow: 'shadow-lg shadow-yellow-500/50',
        gradient: 'bg-gradient-to-r from-yellow-500 to-orange-600'
      };
    }
    if (percentage >= 25) {
      return {
        bg: darkMode ? 'bg-orange-600' : 'bg-orange-500',
        glow: 'shadow-lg shadow-orange-500/50',
        gradient: 'bg-gradient-to-r from-orange-500 to-red-600'
      };
    }
    return {
      bg: darkMode ? 'bg-red-600' : 'bg-red-500',
      glow: 'shadow-lg shadow-red-500/50',
      gradient: 'bg-gradient-to-r from-red-500 to-rose-600'
    };
  };

  return {
    getProgressColor,
    getCategoryColors,
    getPriorityColors,
    getStatusColors,
    getProgressBarColors
  };
};
