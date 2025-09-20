import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import SearchBar from './components/SearchBar';
import FilterControls from './components/FilterControls';
import BelongingsList from './components/BelongingsList';
import BelongingForm from './components/BelongingForm';
import BulkAddForm from './components/BulkAddForm';
import QuickActions from './components/QuickActions';
import Schedule from './components/Schedule';
import Analytics from './components/Analytics';
import ThemeToggle from './components/ThemeToggle';
import ConfettiAnimation from './components/ConfettiAnimation';
import AISuggestions from './components/AISuggestions';
import { belongingsAPI } from './api';
import { PlusIcon, HomeIcon, QueueListIcon, CalendarDaysIcon, ChartBarIcon } from '@heroicons/react/24/outline';

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { colors } = useTheme();
  const [belongings, setBelongings] = useState([]);
  const [filteredBelongings, setFilteredBelongings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingBelonging, setEditingBelonging] = useState(null);
  
  // Navigation state
  const [currentPage, setCurrentPage] = useState('packing');
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Available options for filters
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  // Load data functions wrapped in useCallback to prevent infinite re-renders
  const loadBelongings = useCallback(async () => {
    await fetchBelongings();
    await fetchCategories();
    await fetchTags();
  }, []);

  const loadScheduleEvents = useCallback(async () => {
    // Add schedule events loading if needed
    // For now, this is a placeholder
  }, []);

  // Apply filters function
  const applyFilters = useCallback(() => {
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
  }, [belongings, searchTerm, selectedCategory, selectedTag, selectedStatus]);

  // Fetch belongings on component mount
  useEffect(() => {
    loadBelongings();
    loadScheduleEvents();
  }, [loadBelongings, loadScheduleEvents]);

  // Apply filters whenever belongings or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Check for completion and trigger confetti
  useEffect(() => {
    const packedCount = belongings.filter(item => item.status === 'packed').length;
    const totalCount = belongings.length;
    
    if (totalCount > 0 && packedCount === totalCount && packedCount > 0) {
      setShowConfetti(true);
    }
  }, [belongings]);

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
    // Remove confirmation dialog
    try {
      await belongingsAPI.delete(id);
      await fetchBelongings();
      await fetchCategories();
      await fetchTags();
    } catch (err) {
      console.error('Error deleting belonging:', err);
      setError('Failed to delete belonging');
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

  // Helper function for schedule page to update belongings
  const handleBelongingUpdate = async (id, newStatus) => {
    await handleToggleStatus(id, newStatus);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTag('');
    setSelectedStatus('');
  };

  // Quick action functions
  const handleSelectAll = () => {
    // For now, just clear filters to show all items
    clearFilters();
  };

  const handleAddSuggestion = async (suggestion) => {
    try {
      const newItem = {
        name: suggestion.name,
        category: suggestion.category,
        tags: suggestion.reason ? [suggestion.reason] : [],
        status: 'unpacked',
        priority: suggestion.priority || 'medium'
      };
      
      await belongingsAPI.create(newItem);
      await loadBelongings();
      
      // Show success feedback
      setSuccessMessage(`✅ Added "${suggestion.name}" to your packing list!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding suggestion:', err);
      setError('Failed to add suggested item');
    }
  };

  const handleMarkAllPacked = async () => {
    if (window.confirm(`Mark all ${filteredBelongings.length} visible items as packed?`)) {
      try {
        const updatePromises = filteredBelongings
          .filter(item => item.status !== 'packed')
          .map(item => belongingsAPI.update(item.id, { ...item, status: 'packed' }));
        
        await Promise.all(updatePromises);
        await fetchBelongings();
      } catch (err) {
        console.error('Error marking all as packed:', err);
        setError('Failed to mark all items as packed');
      }
    }
  };

  const handleMarkAllUnpacked = async () => {
    if (window.confirm(`Mark all ${filteredBelongings.length} visible items as unpacked?`)) {
      try {
        const updatePromises = filteredBelongings
          .filter(item => item.status !== 'unpacked')
          .map(item => belongingsAPI.update(item.id, { ...item, status: 'unpacked' }));
        
        await Promise.all(updatePromises);
        await fetchBelongings();
      } catch (err) {
        console.error('Error marking all as unpacked:', err);
        setError('Failed to mark all items as unpacked');
      }
    }
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
    <div className={`min-h-screen transition-colors duration-300 ${colors.bg.primary}`}>
      {/* Header */}
      <header className={`shadow-sm border-b transition-colors duration-300 ${colors.bg.secondary} ${colors.border.primary}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <HomeIcon className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className={`text-xl font-bold transition-colors duration-300 ${colors.text.primary}`}>Packing Tracker</h1>
                <p className={`text-sm transition-colors duration-300 ${colors.text.secondary}`}>Organize your college belongings</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => setCurrentPage('packing')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentPage === 'packing'
                      ? `${colors.primary.bg} ${colors.primary.text}`
                      : `${colors.text.secondary} ${colors.bg.hover}`
                  }`}
                >
                  Packing List
                </button>
                <button
                  onClick={() => setCurrentPage('schedule')}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentPage === 'schedule'
                      ? `${colors.primary.bg} ${colors.primary.text}`
                      : `${colors.text.secondary} ${colors.bg.hover}`
                  }`}
                >
                    <CalendarDaysIcon className="h-4 w-4" />
                  Schedule
                </button>
                <button
                  onClick={() => setCurrentPage('analytics')}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentPage === 'analytics'
                      ? `${colors.primary.bg} ${colors.primary.text}`
                      : `${colors.text.secondary} ${colors.bg.hover}`
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4" />
                  Analytics
                </button>
              </nav>
            </div>
            
            <div className="flex items-center gap-2">
              {currentPage === 'packing' && (
                <>
                  <button
                    onClick={handleBulkAdd}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${colors.primary.button} text-white`}
                  >
                    <QueueListIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Bulk Add</span>
                  </button>
                  <button
                    onClick={handleAddBelonging}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${colors.success.button} text-white`}
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Add Item</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Navigation */}
        <div className="md:hidden mb-6">
          <nav className="flex space-x-2">
            <button
              onClick={() => setCurrentPage('packing')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                currentPage === 'packing'
                  ? `${colors.primary.bg} ${colors.primary.text}`
                  : `${colors.text.secondary} ${colors.bg.hover}`
              }`}
            >
              Packing
            </button>
            <button
              onClick={() => setCurrentPage('schedule')}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                currentPage === 'schedule'
                  ? `${colors.primary.bg} ${colors.primary.text}`
                  : `${colors.text.secondary} ${colors.bg.hover}`
              }`}
            >
              <CalendarDaysIcon className="h-4 w-4" />
              Schedule
            </button>
            <button
              onClick={() => setCurrentPage('analytics')}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                currentPage === 'analytics'
                  ? `${colors.primary.bg} ${colors.primary.text}`
                  : `${colors.text.secondary} ${colors.bg.hover}`
              }`}
            >
              <ChartBarIcon className="h-4 w-4" />
              Analytics
            </button>
          </nav>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-800 rounded-lg shadow-sm animate-slideInDown">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-800 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {currentPage === 'packing' ? (
          <>
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

            {/* Quick Actions */}
            <QuickActions
              onAddNew={handleAddBelonging}
              onBulkAdd={handleBulkAdd}
              onSelectAll={handleSelectAll}
              onMarkAllPacked={handleMarkAllPacked}
              onMarkAllUnpacked={handleMarkAllUnpacked}
              onClearFilters={clearFilters}
              belongings={belongings}
              filteredBelongings={filteredBelongings}
            />

            {/* AI Suggestions */}
            <AISuggestions
              belongings={belongings}
              onAddSuggestion={handleAddSuggestion}
              className="mb-6"
            />

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
          </>
        ) : currentPage === 'schedule' ? (
          /* Schedule Page */
          <Schedule
            belongings={belongings}
            onBelongingUpdate={handleBelongingUpdate}
          />
        ) : (
          /* Analytics Page */
          <Analytics />
        )}
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

      {/* Confetti Animation */}
      <ConfettiAnimation 
        show={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
    </div>
  );
}

export default App;
