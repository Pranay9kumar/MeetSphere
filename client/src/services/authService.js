import api from './api';

/**
 * Register a new user.
 * @param {object} userData - { name, email, password }
 * @returns {Promise<object>} User data with JWT token
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Login with email and password.
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} User data with JWT token
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateSettings = async (settings) => {
  const response = await api.patch('/auth/settings', settings);
  return response.data;
};

