import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const belongingsAPI = {
  // Get all belongings with optional filters
  getAll: (params = {}) => api.get('/belongings', { params }),
  
  // Get single belonging by ID
  getById: (id) => api.get(`/belongings/${id}`),
  
  // Create new belonging
  create: (belonging) => api.post('/belongings', belonging),
  
  // Create multiple belongings
  createBulk: (items) => api.post('/belongings/bulk', { items }),
  
  // Update belonging
  update: (id, belonging) => api.put(`/belongings/${id}`, belonging),
  
  // Delete belonging
  delete: (id) => api.delete(`/belongings/${id}`),
  
  // Get available categories
  getCategories: () => api.get('/categories'),
  
  // Get available tags
  getTags: () => api.get('/tags'),
};

export const scheduleAPI = {
  // Get all schedule events with optional day type filter
  getEvents: (params = {}) => api.get('/schedule/events', { params }),
  
  // Get single event by ID
  getEventById: (id) => api.get(`/schedule/events/${id}`),
  
  // Create new event
  createEvent: (event) => api.post('/schedule/events', event),
  
  // Update event
  updateEvent: (id, event) => api.put(`/schedule/events/${id}`, event),
  
  // Delete event
  deleteEvent: (id) => api.delete(`/schedule/events/${id}`),
  
  // Get belongings for a specific event
  getEventBelongings: (id) => api.get(`/schedule/events/${id}/belongings`),
};

export default api;
