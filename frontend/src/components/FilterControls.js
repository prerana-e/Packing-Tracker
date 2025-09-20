import React from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const FilterControls = ({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  selectedStatus,
  onCategoryChange,
  onTagChange,
  onStatusChange,
  onClearFilters
}) => {
  const hasActiveFilters = selectedCategory || selectedTag || selectedStatus;

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <FunnelIcon className="h-4 w-4" />
        <span className="font-medium">Filters:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>

        {/* Tag Filter */}
        <select
          value={selectedTag}
          onChange={(e) => onTagChange(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All Tags</option>
          {tags.map(tag => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All Status</option>
          <option value="packed">Packed</option>
          <option value="unpacked">Unpacked</option>
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100"
          >
            <XMarkIcon className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterControls;
