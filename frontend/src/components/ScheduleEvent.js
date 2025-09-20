import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClockIcon, 
  PencilIcon, 
  TrashIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { scheduleAPI } from '../api';

const ScheduleEvent = ({ event, belongings, onEdit, onDelete, onBelongingUpdate, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [eventBelongings, setEventBelongings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEventBelongings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await scheduleAPI.getEventBelongings(event.id);
      setEventBelongings(response.data);
    } catch (err) {
      console.error('Error fetching event belongings:', err);
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    if (isExpanded && event.belonging_ids.length > 0) {
      fetchEventBelongings();
    }
  }, [isExpanded, event.belonging_ids.length, fetchEventBelongings]);

  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getEventDuration = () => {
    if (!event.start_time || !event.end_time) return '';
    const start = new Date(`2000-01-01T${event.start_time}`);
    const end = new Date(`2000-01-01T${event.end_time}`);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      const diffMinutes = diffMs / (1000 * 60);
      return `${diffMinutes} min`;
    } else if (diffHours === 1) {
      return '1 hour';
    } else {
      const hours = Math.floor(diffHours);
      const minutes = Math.round((diffHours - hours) * 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hours`;
    }
  };

  const getCompletionStats = () => {
    if (eventBelongings.length === 0) return null;
    
    const completed = eventBelongings.filter(item => item.status === 'packed').length;
    const total = eventBelongings.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const handleToggleItem = async (itemId, currentStatus) => {
    const newStatus = currentStatus === 'packed' ? 'unpacked' : 'packed';
    
    try {
      // Update the item status via the parent component
      await onBelongingUpdate(itemId, newStatus);
      
      // Update local state
      setEventBelongings(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error('Error updating item status:', err);
    }
  };

  const completionStats = getCompletionStats();

  // Compact mode for fluid timeline
  if (compact) {
    return (
      <div>
        <div className="flex items-center justify-between">
          {/* Action buttons for compact mode */}
          <div className="flex items-center gap-1">
            {event.belonging_ids.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title={isExpanded ? 'Collapse items' : 'Show items'}
              >
                {isExpanded ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Edit event"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event.id);
              }}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
              title="Delete event"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Expandable Items List for compact mode */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Related Items Checklist
            </h4>
            
            {loading ? (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-xs text-gray-600">Loading items...</span>
              </div>
            ) : eventBelongings.length > 0 ? (
              <div className="space-y-2">
                {eventBelongings.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleToggleItem(item.id, item.status)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleItem(item.id, item.status);
                        }}
                        className="flex-shrink-0"
                      >
                        {item.status === 'packed' ? (
                          <CheckCircleIconSolid className="h-5 w-5 text-green-600" />
                        ) : (
                          <CheckCircleIcon className="h-5 w-5 text-gray-400 hover:text-green-600" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm ${
                          item.status === 'packed' 
                            ? 'text-gray-500 line-through' 
                            : 'text-gray-900'
                        }`}>
                          {item.name}
                        </span>
                        <div className="text-xs text-gray-500">
                          {item.category} • {item.room}
                        </div>
                      </div>
                      
                      {/* Clickable indicator */}
                      <span className="text-xs text-gray-400 italic">
                        (click to {item.status === 'packed' ? 'unpack' : 'pack'})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No items linked to this event.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Event Header - Make clickable */}
      <div 
        className={`p-4 ${event.belonging_ids.length > 0 ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
        onClick={event.belonging_ids.length > 0 ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {event.title}
              </h3>
              {event.belonging_ids.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {event.belonging_ids.length} item{event.belonging_ids.length !== 1 ? 's' : ''}
                </span>
              )}
              {/* Clickable indicator */}
              {event.belonging_ids.length > 0 && (
                <span className="text-xs text-gray-400 italic">
                  (click to {isExpanded ? 'collapse' : 'expand'})
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                <span>
                  {formatTime12Hour(event.start_time)} - {formatTime12Hour(event.end_time)}
                </span>
                <span className="text-gray-400">({getEventDuration()})</span>
              </div>
            </div>

            {event.notes && (
              <div className="flex items-start gap-1 mt-2 text-sm text-gray-600">
                <DocumentTextIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="break-words">{event.notes}</p>
              </div>
            )}

            {/* Completion Progress */}
            {completionStats && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-gray-900">
                    {completionStats.completed}/{completionStats.total} completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionStats.percentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-4">
            {event.belonging_ids.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title={isExpanded ? 'Collapse items' : 'Show items'}
              >
                {isExpanded ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Edit event"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event.id);
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
              title="Delete event"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Items List */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Related Items Checklist
            </h4>
            
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading items...</span>
              </div>
            ) : eventBelongings.length > 0 ? (
              <div className="space-y-2">
                {eventBelongings.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      item.status === 'packed'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => handleToggleItem(item.id, item.status)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleItem(item.id, item.status);
                      }}
                      className={`flex-shrink-0 transition-colors ${
                        item.status === 'packed'
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-gray-400 hover:text-green-600'
                      }`}
                    >
                      {item.status === 'packed' ? (
                        <CheckCircleIconSolid className="h-6 w-6" />
                      ) : (
                        <CheckCircleIcon className="h-6 w-6" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          item.status === 'packed' 
                            ? 'text-gray-700 line-through' 
                            : 'text-gray-900'
                        }`}>
                          {item.name}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {item.category}
                        </span>
                        {/* Clickable indicator */}
                        <span className="text-xs text-gray-400 italic ml-auto">
                          (click to {item.status === 'packed' ? 'unpack' : 'pack'})
                        </span>
                      </div>
                      
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded border"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No items linked to this event.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleEvent;
