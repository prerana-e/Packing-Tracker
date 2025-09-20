import React from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  PencilIcon, 
  TrashIcon,
  ArchiveBoxIcon 
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

const BelongingItem = ({ belonging, onEdit, onDelete, onToggleStatus }) => {
  const { id, name, category, tags, status } = belonging;
  const isPacked = status === 'packed';

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'electronics':
        return '📱';
      case 'clothes':
        return '👕';
      case 'documents':
        return '📄';
      case 'books':
        return '📚';
      case 'bedding':
        return '🛏️';
      case 'kitchenware':
        return '🍽️';
      case 'toiletries':
        return '🧴';
      default:
        return '📦';
    }
  };

  const getStatusColor = (status) => {
    return status === 'packed' 
      ? 'text-success-600 bg-success-50 border-success-200' 
      : 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className={`
      bg-white rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md
      ${isPacked ? 'border-success-200 bg-success-50/30' : 'border-gray-200'}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Header with icon and name */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{getCategoryIcon(category)}</span>
            <div className="flex-1 min-w-0">
              <h3 className={`
                text-lg font-semibold truncate
                ${isPacked ? 'text-gray-700 line-through' : 'text-gray-900'}
              `}>
                {name}
              </h3>
              <p className="text-sm text-gray-500 capitalize">
                {category}
              </p>
            </div>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={`
              inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border
              ${getStatusColor(status)}
            `}>
              {isPacked ? (
                <CheckCircleIconSolid className="h-3 w-3" />
              ) : (
                <ArchiveBoxIcon className="h-3 w-3" />
              )}
              {isPacked ? 'Packed' : 'Unpacked'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={() => onToggleStatus(id, isPacked ? 'unpacked' : 'packed')}
            className={`
              p-2 rounded-full transition-colors
              ${isPacked 
                ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                : 'text-success-600 hover:text-success-700 hover:bg-success-100'
              }
            `}
            title={isPacked ? 'Mark as unpacked' : 'Mark as packed'}
          >
            {isPacked ? (
              <XCircleIcon className="h-5 w-5" />
            ) : (
              <CheckCircleIcon className="h-5 w-5" />
            )}
          </button>
          
          <button
            onClick={() => onEdit(belonging)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Edit item"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => onDelete(id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
            title="Delete item"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BelongingItem;
