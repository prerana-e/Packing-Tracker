import React, { useState, useEffect, useCallback } from 'react';
import { scheduleAPI } from '../api';
import ScheduleEvent from './ScheduleEvent';
import EventForm from './EventForm';
import { PlusIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const Schedule = ({ belongings, onBelongingUpdate }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState('packing');
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await scheduleAPI.getEvents({ day_type: selectedDay });
      setEvents(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch schedule events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDay]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleEventSubmit = async (eventData) => {
    try {
      if (editingEvent) {
        await scheduleAPI.updateEvent(editingEvent.id, eventData);
      } else {
        await scheduleAPI.createEvent(eventData);
      }
      
      await fetchEvents();
      setShowEventForm(false);
      setEditingEvent(null);
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Failed to save event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await scheduleAPI.deleteEvent(id);
        await fetchEvents();
      } catch (err) {
        console.error('Error deleting event:', err);
        setError('Failed to delete event');
      }
    }
  };

  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const sortEventsByTime = (events) => {
    return [...events].sort((a, b) => {
      return a.start_time.localeCompare(b.start_time);
    });
  };

  const sortedEvents = sortEventsByTime(events);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-2">⚠️</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchEvents();
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDaysIcon className="h-8 w-8 text-primary-600" />
            Schedule
          </h1>
          <p className="text-gray-600 mt-1">Plan your packing and move-in timeline with flexible scheduling</p>
        </div>
        
        <button
          onClick={handleAddEvent}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Event
        </button>
      </div>

      {/* Day Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex space-x-1">
          <button
            onClick={() => setSelectedDay('packing')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedDay === 'packing'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Packing Day
          </button>
          <button
            onClick={() => setSelectedDay('move-in')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedDay === 'move-in'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Move-in Day
          </button>
        </div>
      </div>

      {/* Fluid Timeline */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {selectedDay.replace('-', ' ')} Schedule
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {events.length} event{events.length !== 1 ? 's' : ''} planned
            {events.length > 0 && (
              <span className="ml-2">
                • {formatTime12Hour(sortedEvents[0]?.start_time)} to {formatTime12Hour(sortedEvents[sortedEvents.length - 1]?.end_time)}
              </span>
            )}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Loading schedule...</span>
          </div>
        ) : events.length > 0 ? (
          <div className="p-6">
            {/* Simple Timeline View */}
            <div className="space-y-6">
              {sortedEvents.map((event, index) => {
                return (
                  <div key={event.id} className="relative flex">
                    {/* Time indicator */}
                    <div className="w-20 flex-shrink-0 text-right pr-4">
                      <div className="text-sm font-medium text-gray-700">
                        {formatTime12Hour(event.start_time)}
                      </div>
                    </div>
                    
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center w-6 flex-shrink-0">
                      <div className="w-3 h-3 bg-primary-600 rounded-full border-2 border-white shadow-sm"></div>
                      {index < sortedEvents.length - 1 && (
                        <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    
                    {/* Event card */}
                    <div className="flex-1 ml-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        {/* Event component for full view */}
                        <ScheduleEvent
                          event={event}
                          belongings={belongings}
                          onEdit={handleEditEvent}
                          onDelete={handleDeleteEvent}
                          onBelongingUpdate={onBelongingUpdate}
                          compact={false}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 px-6">
            <div className="relative">
              <div className="text-7xl mb-6 transform -rotate-12 opacity-80">📅</div>
              <div className="absolute top-0 right-1/2 transform translate-x-8 text-4xl animate-pulse delay-500">⏰</div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Your {selectedDay.replace('-', ' ')} schedule awaits!
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Plan your {selectedDay.replace('-', ' ')} timeline to stay organized. 
              Create events, link your belongings, and track your progress.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">📦</div>
                  <div className="text-sm text-blue-700 font-medium">Pack by Category</div>
                  <div className="text-xs text-blue-600 mt-1">Organize systematically</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-sm text-green-700 font-medium">Track Progress</div>
                  <div className="text-xs text-green-600 mt-1">Stay on schedule</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🚚</div>
                  <div className="text-sm text-purple-700 font-medium">Moving Day</div>
                  <div className="text-xs text-purple-600 mt-1">Execute the plan</div>
                </div>
              </div>
              <button
                onClick={handleAddEvent}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <PlusIcon className="h-5 w-5" />
                  Create Your First Event
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Event Form Modal */}
      <EventForm
        event={editingEvent}
        isOpen={showEventForm}
        dayType={selectedDay}
        belongings={belongings}
        onClose={() => {
          setShowEventForm(false);
          setEditingEvent(null);
        }}
        onSubmit={handleEventSubmit}
      />
    </div>
  );
};

export default Schedule;
