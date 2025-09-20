import React from 'react';
import BelongingItem from './BelongingItem';
import LoadingSkeleton from './LoadingSkeleton';
import { useTheme } from '../contexts/ThemeContext';
import { useColorSystem } from '../hooks/useColorSystem';

const BelongingsList = ({ belongings, onEdit, onDelete, onToggleStatus, loading }) => {
  const { colors } = useTheme();
  const { getProgressBarColors } = useColorSystem();
  
  if (loading) {
    return <LoadingSkeleton variant="list" />;
  }

  if (belongings.length === 0) {
    return (
      <div className={`text-center py-16 px-6 transition-colors duration-300`}>
        <div className="relative animate-fadeIn">
          <div className="text-8xl mb-6 transform rotate-12 opacity-80 animate-pulse">📦</div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-6xl animate-bounce delay-300">✨</div>
        </div>
        <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${colors.text.primary}`}>
          Ready to start your packing journey?
        </h3>
        <p className={`mb-8 max-w-md mx-auto leading-relaxed transition-colors duration-300 ${colors.text.secondary}`}>
          Add your first item and let's get organized! Whether it's clothes, electronics, or documents - 
          we'll help you track everything for a smooth move.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto mb-6">
            <div className={`${colors.primary.bg} ${colors.primary.border} rounded-lg p-3 text-center transition-all duration-300 hover:scale-105 animate-slideInUp stagger-1`}>
              <div className="text-2xl mb-1">👕</div>
              <div className={`text-xs font-medium ${colors.primary.text}`}>Clothes</div>
            </div>
            <div className={`${colors.primary.bg} ${colors.primary.border} rounded-lg p-3 text-center transition-all duration-300 hover:scale-105 animate-slideInUp stagger-2`}>
              <div className="text-2xl mb-1">📱</div>
              <div className={`text-xs font-medium ${colors.primary.text}`}>Electronics</div>
            </div>
            <div className={`${colors.success.bg} ${colors.success.border} rounded-lg p-3 text-center transition-all duration-300 hover:scale-105 animate-slideInUp stagger-3`}>
              <div className="text-2xl mb-1">📄</div>
              <div className={`text-xs font-medium ${colors.success.text}`}>Documents</div>
            </div>
            <div className={`${colors.warning.bg} ${colors.warning.border} rounded-lg p-3 text-center transition-all duration-300 hover:scale-105 animate-slideInUp stagger-4`}>
              <div className="text-2xl mb-1">🍽️</div>
              <div className={`text-xs font-medium ${colors.warning.text}`}>Kitchen</div>
            </div>
          </div>
          <button className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 animate-slideInUp stagger-5`}>
            <span className="flex items-center gap-2">
              <span className="text-lg">+</span>
              Add Your First Item
            </span>
          </button>
        </div>
      </div>
    );
  }

  const packedCount = belongings.filter(item => item.status === 'packed').length;
  const totalCount = belongings.length;
  const progressPercentage = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;
  const progressColors = getProgressBarColors(progressPercentage);

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className={`mb-6 p-4 rounded-lg transition-all duration-300 ${colors.bg.card} ${colors.border.primary} border hover:shadow-lg`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`font-medium transition-colors duration-300 ${colors.text.primary}`}>
            Packing Progress
          </span>
          <span className={`text-sm transition-colors duration-300 ${colors.text.secondary}`}>
            {packedCount} of {totalCount} items packed
          </span>
        </div>
        <div className={`w-full rounded-full h-3 transition-colors duration-300 ${colors.bg.active} overflow-hidden`}>
          <div
            className={`h-3 rounded-full transition-all duration-700 ease-out ${progressColors.gradient} ${progressColors.glow}`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className={`text-xs mt-2 transition-colors duration-300 ${colors.text.muted} flex items-center justify-between`}>
          <span>{progressPercentage}% complete</span>
          {packedCount === totalCount && totalCount > 0 && (
            <span className="text-green-600 dark:text-green-400 font-medium animate-pulse flex items-center gap-1">
              🎉 All packed! Ready to go!
            </span>
          )}
        </div>
      </div>

      {/* Items grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {belongings.map((belonging) => (
          <BelongingItem
            key={belonging.id}
            belonging={belonging}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>
    </div>
  );
};

export default BelongingsList;
