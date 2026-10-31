const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const getAuthToken = () => localStorage.getItem('resumine_token');
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('resumine_token', token);
  } else {
    localStorage.removeItem('resumine_token');
  }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('resumine_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('resumine_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('resumine_user');
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export default API_BASE_URL;

