import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TagIcon } from '@heroicons/react/24/outline';

const BelongingForm = ({ 
  belonging, 
  isOpen, 
  onClose, 
  onSubmit, 
  categories = [],
  existingTags = []
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    tags: [],
    status: 'unpacked'
  });
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // Initialize form data when belonging changes
  useEffect(() => {
    if (belonging) {
      setFormData({
        name: belonging.name || '',
        category: belonging.category || '',
        tags: belonging.tags || [],
        status: belonging.status || 'unpacked'
      });
    } else {
      setFormData({
        name: '',
        category: '',
        tags: [],
        status: 'unpacked'
      });
    }
  }, [belonging]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category.trim()) {
      return;
    }
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      category: '',
      tags: [],
      status: 'unpacked'
    });
    setNewTag('');
    setShowTagInput(false);
    onClose();
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
    setNewTag('');
    setShowTagInput(false);
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(newTag);
    } else if (e.key === 'Escape') {
      setNewTag('');
      setShowTagInput(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {belonging ? 'Edit Belonging' : 'Add New Belonging'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter item name"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select a category</option>
              <option value="electronics">Electronics</option>
              <option value="clothes">Clothes</option>
              <option value="documents">Documents</option>
              <option value="books">Books</option>
              <option value="bedding">Bedding</option>
              <option value="kitchenware">Kitchenware</option>
              <option value="toiletries">Toiletries</option>
              <option value="other">Other</option>
              {categories.map(cat => (
                !['electronics', 'clothes', 'documents', 'books', 'bedding', 'kitchenware', 'toiletries', 'other'].includes(cat) && (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                )
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            
            {/* Existing tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-primary-100 text-primary-700 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-primary-500 hover:text-primary-700"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add tag section */}
            {showTagInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleTagInputKeyPress}
                  onBlur={() => {
                    if (newTag.trim()) {
                      addTag(newTag);
                    } else {
                      setShowTagInput(false);
                    }
                  }}
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter tag name"
                  autoFocus
                />
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowTagInput(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add new tag
                </button>
                
                {/* Quick add from existing tags */}
                {existingTags.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Quick add:</p>
                    <div className="flex flex-wrap gap-1">
                      {existingTags
                        .filter(tag => !formData.tags.includes(tag))
                        .slice(0, 6)
                        .map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => addTag(tag)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <TagIcon className="h-3 w-3" />
                            {tag}
                          </button>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="unpacked">Unpacked</option>
              <option value="packed">Packed</option>
            </select>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
            >
              {belonging ? 'Update' : 'Add'} Belonging
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BelongingForm;
