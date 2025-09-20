import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ArchiveBoxIcon,
  CheckCircleIcon,
  XCircleIcon,
  Squares2X2Icon,
  QueueListIcon
} from '@heroicons/react/24/outline';

const QuickActions = ({ 
  onAddNew, 
  onBulkAdd, 
  onSelectAll, 
  onMarkAllPacked, 
  onMarkAllUnpacked,
  onClearFilters,
  belongings,
  filteredBelongings 
}) => {
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      switch (e.key) {
      case 'n':
      case 'N':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onAddNew();
        }
        break;
      case 'b':
      case 'B':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onBulkAdd();
        }
        break;
      case 'q':
      case 'Q':
        e.preventDefault();
        setShowQuickActions(prev => !prev);
        break;
      case 'Escape':
        setShowQuickActions(false);
        break;
      default:
        // No action needed for other keys
        break;
    }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onAddNew, onBulkAdd, onSelectAll, showQuickActions]);

  const packedCount = filteredBelongings.filter(item => item.status === 'packed').length;
  const unpackedCount = filteredBelongings.filter(item => item.status === 'unpacked').length;

  return (
    <>
      {/* Quick Actions Toolbar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-medium text-gray-700">Quick Actions</h3>
            <div className="flex gap-2">
              <button
                onClick={onAddNew}
                className="inline-flex items-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                Add Item
                <span className="text-xs opacity-75">(Ctrl+N)</span>
              </button>
              
              <button
                onClick={onBulkAdd}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <QueueListIcon className="h-4 w-4" />
                Bulk Add
                <span className="text-xs opacity-75">(Ctrl+B)</span>
              </button>

              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                <Squares2X2Icon className="h-4 w-4" />
                More Actions
                <span className="text-xs opacity-75">(Q)</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <span>{packedCount} packed</span>
            </div>
            <div className="flex items-center gap-1">
              <ArchiveBoxIcon className="h-4 w-4 text-gray-500" />
              <span>{unpackedCount} unpacked</span>
            </div>
            <div className="text-primary-600 font-medium">
              {filteredBelongings.length} total
            </div>
          </div>
        </div>

        {/* Expanded Quick Actions */}
        {showQuickActions && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => {
                  onMarkAllPacked();
                  setShowQuickActions(false);
                }}
                disabled={packedCount === filteredBelongings.length || filteredBelongings.length === 0}
                className="flex items-center gap-2 p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleIcon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium text-sm">Mark All Packed</div>
                  <div className="text-xs opacity-75">Pack all visible items</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onMarkAllUnpacked();
                  setShowQuickActions(false);
                }}
                disabled={unpackedCount === filteredBelongings.length || filteredBelongings.length === 0}
                className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircleIcon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium text-sm">Mark All Unpacked</div>
                  <div className="text-xs opacity-75">Unpack all visible items</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClearFilters();
                  setShowQuickActions(false);
                }}
                className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium text-sm">Clear Filters</div>
                  <div className="text-xs opacity-75">Show all items</div>
                </div>
              </button>

              <button
                onClick={onSelectAll}
                className="flex items-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
              >
                <Squares2X2Icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium text-sm">Select All</div>
                  <div className="text-xs opacity-75">(Ctrl+A)</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      {showQuickActions && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Keyboard Shortcuts</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Add new item:</span>
              <kbd className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">Ctrl+N</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bulk add:</span>
              <kbd className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">Ctrl+B</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Select all:</span>
              <kbd className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">Ctrl+A</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quick actions:</span>
              <kbd className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">Q</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Close/Cancel:</span>
              <kbd className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">Esc</kbd>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;
