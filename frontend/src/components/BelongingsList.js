import React from 'react';
import BelongingItem from './BelongingItem';

const BelongingsList = ({ belongings, onEdit, onDelete, onToggleStatus, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading belongings...</span>
      </div>
    );
  }

  if (belongings.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <div className="relative">
          <div className="text-8xl mb-6 transform rotate-12 opacity-80">📦</div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-6xl animate-bounce delay-300">✨</div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Ready to start your packing journey?
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          Add your first item and let's get organized! Whether it's clothes, electronics, or documents - 
          we'll help you track everything for a smooth move.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">👕</div>
              <div className="text-xs text-blue-700 font-medium">Clothes</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">📱</div>
              <div className="text-xs text-purple-700 font-medium">Electronics</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">📄</div>
              <div className="text-xs text-green-700 font-medium">Documents</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">🍽️</div>
              <div className="text-xs text-orange-700 font-medium">Kitchen</div>
            </div>
          </div>
          <button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
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

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Packing Progress</span>
          <span className="text-sm text-gray-500">
            {packedCount} of {totalCount} items packed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-success-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalCount > 0 ? (packedCount / totalCount) * 100 : 0}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0}% complete
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
