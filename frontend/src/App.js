import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import FilterControls from './components/FilterControls';
import BelongingsList from './components/BelongingsList';
import BelongingForm from './components/BelongingForm';
import BulkAddForm from './components/BulkAddForm';
import { belongingsAPI } from './api';
import { PlusIcon, HomeIcon, QueueListIcon } from '@heroicons/react/24/outline';

function App() {
  const [belongings, setBelongings] = useState([]);
  const [filteredBelongings, setFilteredBelongings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingBelonging, setEditingBelonging] = useState(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Available options for filters
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  // Fetch belongings on component mount
  useEffect(() => {
    fetchBelongings();
    fetchCategories();
    fetchTags();
  }, []);

  // Apply filters whenever belongings or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [belongings, searchTerm, selectedCategory, selectedTag, selectedStatus]);

  const fetchBelongings = async () => {
    try {
      setLoading(true);
      const response = await belongingsAPI.getAll();
      setBelongings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch belongings');
      console.error('Error fetching belongings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await belongingsAPI.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await belongingsAPI.getTags();
      setTags(response.data);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...belongings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(item =>
        item.tags && item.tags.includes(selectedTag)
      );
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredBelongings(filtered);
  };

  const handleAddBelonging = () => {
    setEditingBelonging(null);
    setShowForm(true);
  };

  const handleBulkAdd = () => {
    setShowBulkForm(true);
  };

  const handleEditBelonging = (belonging) => {
    setEditingBelonging(belonging);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingBelonging) {
        // Update existing belonging
        await belongingsAPI.update(editingBelonging.id, formData);
      } else {
        // Create new belonging
        await belongingsAPI.create(formData);
      }
      
      // Refresh data
      await fetchBelongings();
      await fetchCategories();
      await fetchTags();
      
      setShowForm(false);
      setEditingBelonging(null);
    } catch (err) {
      console.error('Error saving belonging:', err);
      setError('Failed to save belonging');
    }
  };

  const handleBulkSubmit = async (itemsArray) => {
    try {
      // Use the bulk API endpoint
      await belongingsAPI.createBulk(itemsArray);
      
      // Refresh data
      await fetchBelongings();
      await fetchCategories();
      await fetchTags();
      
      setShowBulkForm(false);
    } catch (err) {
      console.error('Error bulk adding belongings:', err);
      setError('Failed to add some items');
    }
  };

  const handleDeleteBelonging = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await belongingsAPI.delete(id);
        await fetchBelongings();
        await fetchCategories();
        await fetchTags();
      } catch (err) {
        console.error('Error deleting belonging:', err);
        setError('Failed to delete belonging');
      }
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      const belonging = belongings.find(item => item.id === id);
      if (belonging) {
        await belongingsAPI.update(id, { ...belonging, status: newStatus });
        await fetchBelongings();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTag('');
    setSelectedStatus('');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchBelongings();
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <HomeIcon className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Packing Tracker</h1>
                <p className="text-sm text-gray-500">Organize your college belongings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <QueueListIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Bulk Add</span>
              </button>
              <button
                onClick={handleAddBelonging}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Add Item</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search your belongings..."
            />
            
            {/* Filters */}
            <FilterControls
              categories={categories}
              tags={tags}
              selectedCategory={selectedCategory}
              selectedTag={selectedTag}
              selectedStatus={selectedStatus}
              onCategoryChange={setSelectedCategory}
              onTagChange={setSelectedTag}
              onStatusChange={setSelectedStatus}
              onClearFilters={clearFilters}
            />
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredBelongings.length} of {belongings.length} items
            {(searchTerm || selectedCategory || selectedTag || selectedStatus) && (
              <span className="ml-1">
                (filtered)
              </span>
            )}
          </p>
        </div>

        {/* Belongings List */}
        <BelongingsList
          belongings={filteredBelongings}
          onEdit={handleEditBelonging}
          onDelete={handleDeleteBelonging}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />
      </main>

      {/* Form Modal */}
      <BelongingForm
        belonging={editingBelonging}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingBelonging(null);
        }}
        onSubmit={handleFormSubmit}
        categories={categories}
        existingTags={tags}
      />

      {/* Bulk Add Modal */}
      <BulkAddForm
        isOpen={showBulkForm}
        onClose={() => setShowBulkForm(false)}
        onSubmit={handleBulkSubmit}
        categories={categories}
        existingTags={tags}
      />
    </div>
  );
}

export default App;
