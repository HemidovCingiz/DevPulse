const API_BASE_URL = 'https://devpulse-1-pxvk.onrender.com';

export const customFetch = async (endpoint, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: defaultHeaders,
  });

  if (!response.ok) {
    throw new Error(`API Hatası: ${response.status}`);
  }

  return await response.json();
};