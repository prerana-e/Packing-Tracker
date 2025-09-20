import React, { useState, useEffect } from 'react';
import { XMarkIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const EventForm = ({
  event,
  isOpen,
  dayType,
  belongings,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    title: '',
    start_time: '',
    end_time: '',
    day_type: dayType,
    notes: '',
    belonging_ids: []
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        day_type: event.day_type || dayType,
        notes: event.notes || '',
        belonging_ids: event.belonging_ids || []
      });
    } else {
      setFormData({
        title: '',
        start_time: '',
        end_time: '',
        day_type: dayType,
        notes: '',
        belonging_ids: []
      });
    }
  }, [event, dayType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.start_time || !formData.end_time) {
      return;
    }

    // Validate that end time is after start time
    if (formData.start_time >= formData.end_time) {
      alert('End time must be after start time');
      return;
    }

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      start_time: '',
      end_time: '',
      day_type: dayType,
      notes: '',
      belonging_ids: []
    });
    onClose();
  };

  const handleBelongingToggle = (belongingId) => {
    setFormData(prev => ({
      ...prev,
      belonging_ids: prev.belonging_ids.includes(belongingId)
        ? prev.belonging_ids.filter(id => id !== belongingId)
        : [...prev.belonging_ids, belongingId]
    }));
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hour12 = hour % 12 || 12;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const display = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
        options.push({ value: time, display });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {event ? 'Edit Event' : 'Add New Event'}
            </h2>
            <p className="text-sm text-gray-500 mt-1 capitalize">
              {dayType.replace('-', ' ')} day
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
          {/* Event Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Pack bedroom items, Load moving truck"
              required
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                <ClockIcon className="h-4 w-4 inline mr-1" />
                Start Time *
              </label>
              <select
                id="start_time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select start time</option>
                {timeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.display}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                <ClockIcon className="h-4 w-4 inline mr-1" />
                End Time *
              </label>
              <select
                id="end_time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select end time</option>
                {timeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.display}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              <DocumentTextIcon className="h-4 w-4 inline mr-1" />
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Additional details, reminders, or instructions..."
            />
          </div>

          {/* Related Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Packing Items
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Select items that need to be completed during this event. 
              You'll be able to check them off directly in the schedule.
            </p>
            
            {belongings && belongings.length > 0 ? (
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                {belongings.map(belonging => (
                  <label
                    key={belonging.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={formData.belonging_ids.includes(belonging.id)}
                      onChange={() => handleBelongingToggle(belonging.id)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {belonging.name}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {belonging.category}
                        </span>
                      </div>
                      {belonging.tags && belonging.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {belonging.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {belonging.status === 'packed' && (
                      <span className="text-xs text-green-600 font-medium">
                        ✓ Packed
                      </span>
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic p-3 border border-gray-200 rounded-md">
                No packing items available. Add some items to your packing list first.
              </p>
            )}
            
            {formData.belonging_ids.length > 0 && (
              <p className="text-sm text-primary-600 mt-2">
                {formData.belonging_ids.length} item{formData.belonging_ids.length !== 1 ? 's' : ''} selected
              </p>
            )}
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
              className="flex-1 px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
            >
              {event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
