import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchEvents();
  }, [selectedDay]);

  const fetchEvents = async () => {
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
  };

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

  const getEventDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end - start) / (1000 * 60); // duration in minutes
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  };

  const getTimelinePosition = (time) => {
    // Convert time to minutes from midnight
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getMinMaxTimes = () => {
    if (events.length === 0) return { min: 360, max: 1320 }; // 6 AM to 10 PM by default
    
    const startTimes = events.map(e => getTimelinePosition(e.start_time));
    const endTimes = events.map(e => getTimelinePosition(e.end_time));
    
    const earliestStart = Math.min(...startTimes);
    const latestEnd = Math.max(...endTimes);
    
    // Add some padding around events
    const min = Math.max(0, earliestStart - 60); // 1 hour before earliest
    const max = Math.min(1440, latestEnd + 60); // 1 hour after latest
    
    return { min, max };
  };

  const generateTimeMarkers = (min, max) => {
    const markers = [];
    const startHour = Math.floor(min / 60);
    const endHour = Math.ceil(max / 60);
    
    for (let hour = startHour; hour <= endHour; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      const time12 = formatTime12Hour(time24);
      const position = hour * 60;
      
      if (position >= min && position <= max) {
        markers.push({ time24, time12, position });
      }
    }
    return markers;
  };

  const sortedEvents = sortEventsByTime(events);
  const { min: minTime, max: maxTime } = getMinMaxTimes();
  const timeMarkers = generateTimeMarkers(minTime, maxTime);
  const timelineRange = maxTime - minTime;

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
            {/* Timeline View */}
            <div className="relative">
              {/* Time markers */}
              <div className="absolute left-0 top-0 w-20 h-full">
                {timeMarkers.map(marker => {
                  const topPercent = ((marker.position - minTime) / timelineRange) * 100;
                  return (
                    <div
                      key={marker.time24}
                      className="absolute text-xs text-gray-500 font-medium"
                      style={{ top: `${topPercent}%` }}
                    >
                      {marker.time12}
                    </div>
                  );
                })}
              </div>

              {/* Timeline line */}
              <div className="absolute left-20 top-0 w-0.5 h-full bg-gray-200 ml-2"></div>

              {/* Events */}
              <div className="ml-24 space-y-4">
                {sortedEvents.map((event, index) => {
                  const duration = getEventDuration(event.start_time, event.end_time);
                  const startPos = getTimelinePosition(event.start_time);
                  const topPercent = ((startPos - minTime) / timelineRange) * 100;
                  
                  return (
                    <div
                      key={event.id}
                      className="relative"
                      style={{ 
                        marginTop: index === 0 ? `${topPercent}%` : '1rem',
                      }}
                    >
                      {/* Time indicator */}
                      <div className="absolute -left-24 top-2 text-sm font-medium text-gray-700 text-right w-20">
                        {formatTime12Hour(event.start_time)}
                      </div>
                      
                      {/* Event connector */}
                      <div className="absolute -left-2 top-4 w-2 h-2 bg-primary-600 rounded-full border-2 border-white shadow-sm"></div>
                      
                      {/* Event card */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {event.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <span className="flex items-center gap-1">
                                🕐 {formatTime12Hour(event.start_time)} - {formatTime12Hour(event.end_time)}
                              </span>
                              <span className="text-blue-600 font-medium">
                                {formatDuration(duration)}
                              </span>
                              {event.belonging_ids && event.belonging_ids.length > 0 && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                  {event.belonging_ids.length} item{event.belonging_ids.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            {event.notes && (
                              <p className="text-sm text-gray-600 bg-white rounded p-2 border">
                                {event.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Event component for detailed view */}
                        <ScheduleEvent
                          event={event}
                          belongings={belongings}
                          onEdit={handleEditEvent}
                          onDelete={handleDeleteEvent}
                          onBelongingUpdate={onBelongingUpdate}
                          compact={true}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events scheduled</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first {selectedDay.replace('-', ' ')} event.
            </p>
            <button
              onClick={handleAddEvent}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Add Event
            </button>
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
