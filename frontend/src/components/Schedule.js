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
      console.log('Fetched events:', response.data); // Debug log
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

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour <= 23; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      const time12 = formatTime12Hour(time24);
      slots.push({ time24, time12 });
    }
    return slots;
  };

  const formatTime12Hour = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getEventsForTimeSlot = (time24) => {
    return events.filter(event => {
      const eventStart = event.start_time;
      const eventEnd = event.end_time;
      
      // Convert times to minutes for easier comparison
      const slotMinutes = timeToMinutes(time24);
      const nextSlotMinutes = slotMinutes + 60; // Each slot is 1 hour
      const eventStartMinutes = timeToMinutes(eventStart);
      const eventEndMinutes = timeToMinutes(eventEnd);
      
      // Event overlaps with this time slot if it starts before the slot ends
      // and ends after the slot starts
      return eventStartMinutes < nextSlotMinutes && eventEndMinutes > slotMinutes;
    });
  };

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const timeSlots = generateTimeSlots();

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
          <p className="text-gray-600 mt-1">Plan your packing and move-in timeline</p>
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

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {selectedDay.replace('-', ' ')} Schedule
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {events.length} event{events.length !== 1 ? 's' : ''} planned
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Loading schedule...</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {timeSlots.map(({ time24, time12 }) => {
              const slotEvents = getEventsForTimeSlot(time24);
              
              return (
                <div key={time24} className="flex min-h-[60px]">
                  {/* Time label */}
                  <div className="w-20 p-3 text-sm font-medium text-gray-500 border-r border-gray-100">
                    {time12}
                  </div>
                  
                  {/* Events for this time slot */}
                  <div className="flex-1 p-3">
                    {slotEvents.length > 0 ? (
                      <div className="space-y-2">
                        {slotEvents.map(event => (
                          <ScheduleEvent
                            key={event.id}
                            event={event}
                            belongings={belongings}
                            onEdit={handleEditEvent}
                            onDelete={handleDeleteEvent}
                            onBelongingUpdate={onBelongingUpdate}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm italic">
                        No events scheduled
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && events.length === 0 && (
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
