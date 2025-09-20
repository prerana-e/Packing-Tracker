import React from 'react';
import BelongingItem from './BelongingItem';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';

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
      <div className="text-center py-12">
        <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No belongings found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding your first item to track.
        </p>
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
