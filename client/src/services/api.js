const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== '/api') {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '3000') {
    return 'http://localhost:5000/api';
  }
  return '/api';
};

export async function request(endpoint, options = {}) {
  const BASE_URL = getBaseUrl();
  const { body, headers = {}, ...customOptions } = options;

  const reqHeaders = { ...headers };

  const token = localStorage.getItem('token');
  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: options.method || 'GET',
    headers: reqHeaders,
    credentials: 'include',
    ...customOptions,
  };

  if (body) {
    if (body instanceof FormData) {
      config.body = body;
    } else {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  let json = {};
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    json = await response.json();
  }

  if (!response.ok) {
    const error = new Error(json.message || json.error || 'API Request Failed');
    error.status = response.status;
    error.data = json;
    throw error;
  }

  return json.data !== undefined ? json.data : json;
}

export const api = {
  request,
  // Auth
  register: async (userData) => {
    const data = await request('/auth/register', { method: 'POST', body: userData });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  login: async (credentials) => {
    const data = await request('/auth/login', { method: 'POST', body: credentials });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('token');
    }
  },

  getMe: () => request('/auth/me'),

  // Dashboard
  getStats: () => request('/dashboard/stats'),
  getRecentUploads: () => request('/dashboard/recent'),
  getActivity: () => request('/dashboard/activity'),

  // Files
  listFiles: (params = '') => request(`/files${params ? `?${params}` : ''}`),
  uploadFile: (formData) => request('/files/upload', { method: 'POST', body: formData }),
  deleteFile: (id) => request(`/files/${id}`, { method: 'DELETE' }),
  getFile: (id) => request(`/files/${id}`),

  // Folders
  listFolders: () => request('/folders'),
  createFolder: (name, parentId = null) => request('/folders', { method: 'POST', body: { name, parentId } }),
  deleteFolder: (id) => request(`/folders/${id}`, { method: 'DELETE' }),

  // Favorites
  listFavorites: () => request('/favorites'),
  toggleFavorite: (fileId, folderId) => request('/favorites', { method: 'POST', body: { fileId, folderId } }),
  removeFavorite: (id) => request(`/favorites/${id}`, { method: 'DELETE' }),

  // Shared
  listShared: () => request('/share'),
  createShareLink: (fileId, accessType = 'VIEW') => request('/share', { method: 'POST', body: { fileId, accessType } }),

  // Search
  search: (query) => request(`/search?q=${encodeURIComponent(query)}`),
};
