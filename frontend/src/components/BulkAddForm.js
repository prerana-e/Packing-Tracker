import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TagIcon, TrashIcon } from '@heroicons/react/24/outline';

const BulkAddForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  categories = [],
  existingTags = []
}) => {
  const [items, setItems] = useState([{ name: '', id: Date.now() }]);
  const [sharedData, setSharedData] = useState({
    category: '',
    tags: [],
    status: 'unpacked'
  });
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setItems([{ name: '', id: Date.now() }]);
      setSharedData({
        category: '',
        tags: [],
        status: 'unpacked'
      });
      setNewTag('');
      setShowTagInput(false);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty items
    const validItems = items.filter(item => item.name.trim());
    
    if (validItems.length === 0 || !sharedData.category.trim()) {
      return;
    }

    // Prepare items for submission
    const itemsToSubmit = validItems.map(item => ({
      name: item.name.trim(),
      category: sharedData.category,
      tags: sharedData.tags,
      status: sharedData.status
    }));

    onSubmit(itemsToSubmit);
    handleClose();
  };

  const handleClose = () => {
    setItems([{ name: '', id: Date.now() }]);
    setSharedData({
      category: '',
      tags: [],
      status: 'unpacked'
    });
    setNewTag('');
    setShowTagInput(false);
    onClose();
  };

  const addItem = () => {
    setItems(prev => [...prev, { name: '', id: Date.now() }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateItemName = (id, name) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, name } : item
    ));
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !sharedData.tags.includes(trimmedTag)) {
      setSharedData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
    setNewTag('');
    setShowTagInput(false);
  };

  const removeTag = (tagToRemove) => {
    setSharedData(prev => ({
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

  const parseItemsFromText = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const newItems = lines.map(line => ({
      name: line.trim(),
      id: Date.now() + Math.random()
    }));
    setItems(newItems.length > 0 ? newItems : [{ name: '', id: Date.now() }]);
  };

  const getTextFromItems = () => {
    return items.map(item => item.name).join('\n');
  };

  if (!isOpen) return null;

  const validItemsCount = items.filter(item => item.name.trim()).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Bulk Add Items
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Add multiple items with shared properties
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Shared Properties */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Shared Properties</h3>
            
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                value={sharedData.category}
                onChange={(e) => setSharedData(prev => ({ ...prev, category: e.target.value }))}
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
                Tags (shared by all items)
              </label>
              
              {/* Existing tags */}
              <div className="flex flex-wrap gap-2 mb-2">
                {sharedData.tags.map((tag, index) => (
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
                    Add tag
                  </button>
                  
                  {/* Quick add from existing tags */}
                  {existingTags.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Quick add:</p>
                      <div className="flex flex-wrap gap-1">
                        {existingTags
                          .filter(tag => !sharedData.tags.includes(tag))
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
                value={sharedData.status}
                onChange={(e) => setSharedData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="unpacked">Unpacked</option>
                <option value="packed">Packed</option>
              </select>
            </div>
          </div>

          {/* Items Input Methods */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Items to Add</h3>
              <div className="text-sm text-gray-500">
                {validItemsCount} item{validItemsCount !== 1 ? 's' : ''} ready
              </div>
            </div>

            {/* Input method tabs */}
            <div className="mb-4">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    type="button"
                    className="border-transparent text-primary-600 border-b-2 border-primary-600 py-2 px-1 text-sm font-medium"
                  >
                    Individual Items
                  </button>
                </nav>
              </div>
            </div>

            {/* Individual items input */}
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItemName(item.id, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder={`Item ${index + 1} name`}
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove item"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                Add another item
              </button>
            </div>

            {/* Bulk text input option */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Quick tip:</strong> You can also paste a list of items (one per line) into any field above and they'll be automatically separated!
              </p>
              <textarea
                value={getTextFromItems()}
                onChange={(e) => parseItemsFromText(e.target.value)}
                className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows="4"
                placeholder={`Laptop charger
Textbooks
Winter jacket
...one item per line`}
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={validItemsCount === 0 || !sharedData.category}
              className="flex-1 px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              Add {validItemsCount} Item{validItemsCount !== 1 ? 's' : ''}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkAddForm;
