/**
 * API Service for GameZone Platform
 * Handles HTTP requests, credentials (session cookies), and standardized error responses.
 */

const API_BASE_URL = 'http://localhost:8080/api';

const API = {
  /**
   * Generic request method wrapper around fetch
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    const config = {
      ...options,
      headers,
      credentials: 'include' // Transmit server session cookies
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Handle empty content (e.g. 204 No Content)
      if (response.status === 204) {
        return { success: true, data: null };
      }

      const contentType = response.headers.get('content-type');
      let data = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthenticated status
          localStorage.removeItem('gamezone_user');
          if (!window.location.pathname.endsWith('login.html') && 
              !window.location.pathname.endsWith('register.html') && 
              !window.location.pathname.endsWith('index.html')) {
            window.location.href = 'login.html';
          }
        }
        throw new Error(data.message || data.error || `HTTP Error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  },

  // Auth API
  auth: {
    register: (userData) => API.request('/auth/register', { method: 'POST', body: userData }),
    login: (credentials) => API.request('/auth/login', { method: 'POST', body: credentials }),
    logout: () => API.request('/auth/logout', { method: 'POST' }),
    getCurrentUser: () => API.request('/auth/me', { method: 'GET' })
  },

  // Games API
  games: {
    getAll: () => API.request('/games', { method: 'GET' }),
    getBySlug: (slug) => API.request(`/games/${slug}`, { method: 'GET' }),
    startSession: (slug) => API.request(`/games/${slug}/sessions`, { method: 'POST' }),
    completeSession: (slug, sessionId, payload) => API.request(`/games/${slug}/sessions/${sessionId}/complete`, { method: 'POST', body: payload })
  },

  // Leaderboard API
  leaderboard: {
    getOverall: (page = 0, size = 10) => API.request(`/leaderboard?page=${page}&size=${size}`, { method: 'GET' }),
    getByGame: (slug, page = 0, size = 10) => API.request(`/leaderboard/${slug}?page=${page}&size=${size}`, { method: 'GET' }),
    getUserRank: () => API.request('/leaderboard/me', { method: 'GET' })
  },

  // User Profile & Stats API
  user: {
    getProfile: () => API.request('/users/me', { method: 'GET' }),
    updateProfile: (data) => API.request('/users/me', { method: 'PATCH', body: data }),
    getStats: () => API.request('/users/me/stats', { method: 'GET' }),
    getHistory: (page = 0, size = 10) => API.request(`/users/me/history?page=${page}&size=${size}`, { method: 'GET' })
  }
};
