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

export default api;
