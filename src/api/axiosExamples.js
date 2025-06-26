// ========================================
// AXIOS CONFIGURATION AND USAGE EXAMPLES
// ========================================

import axios from 'axios';

// ========================================
// 1. BASIC AXIOS SETUP
// ========================================

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================================
// 2. REQUEST INTERCEPTOR (Add Auth Token)
// ========================================

api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or wherever you store it
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to prevent caching issues
    config.headers['X-Requested-At'] = new Date().toISOString();
    
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ========================================
// 3. RESPONSE INTERCEPTOR (Handle Errors)
// ========================================

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userToken');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - show access denied message
      console.warn('Access denied. Insufficient permissions.');
    } else if (error.response?.status >= 500) {
      // Server error - show generic error message
      console.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

// ========================================
// 4. API METHODS - BOOKS
// ========================================

export const booksAPI = {
  // Get all books
  getBooks: async (params = {}) => {
    try {
      const response = await api.get('/books', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch books');
    }
  },

  // Get single book
  getBook: async (id) => {
    try {
      const response = await api.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch book');
    }
  },

  // Create new book
  createBook: async (bookData) => {
    try {
      const response = await api.post('/books', bookData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create book');
    }
  },

  // Update book
  updateBook: async (id, bookData) => {
    try {
      const response = await api.put(`/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update book');
    }
  },

  // Delete book
  deleteBook: async (id) => {
    try {
      const response = await api.delete(`/books/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete book');
    }
  },

  // Search books
  searchBooks: async (query) => {
    try {
      const response = await api.get('/books/search', { 
        params: { q: query } 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search books');
    }
  }
};

// ========================================
// 5. API METHODS - AUTHENTICATION
// ========================================

export const authAPI = {
  // Login
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminUser', JSON.stringify(response.data.user || { username: credentials.username }));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
      // Clear local storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      console.warn('Logout API call failed, but local storage cleared');
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await api.post('/auth/verify');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token verification failed');
    }
  }
};

// ========================================
// 6. API METHODS - ISSUES (LIBRARY MANAGEMENT)
// ========================================

export const issuesAPI = {
  // Get all issued books
  getIssuedBooks: async (params = {}) => {
    try {
      const response = await api.get('/issues', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch issued books');
    }
  },

  // Issue a book
  issueBook: async (issueData) => {
    try {
      const response = await api.post('/issues', issueData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to issue book');
    }
  },

  // Return a book
  returnBook: async (issueId) => {
    try {
      const response = await api.patch(`/issues/${issueId}/return`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to return book');
    }
  },

  // Get user's issued books
  getUserIssues: async (userId) => {
    try {
      const response = await api.get(`/issues/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user issues');
    }
  }
};

// ========================================
// 7. API METHODS - ADMIN DASHBOARD
// ========================================

export const adminAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  },

  // Get all users
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  // Generate reports
  generateReport: async (reportType, params = {}) => {
    try {
      const response = await api.get(`/admin/reports/${reportType}`, { 
        params,
        responseType: 'blob' // For file downloads
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate report');
    }
  }
};

// ========================================
// 8. UTILITY FUNCTIONS
// ========================================

// Generic API call with loading state
export const apiCall = async (apiFunction, ...args) => {
  try {
    const result = await apiFunction(...args);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'An error occurred' 
    };
  }
};

// File upload with progress
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (onProgress) onProgress(percentCompleted);
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'File upload failed');
  }
};

// Batch operations
export const batchDelete = async (ids, endpoint) => {
  try {
    const response = await api.delete(`/${endpoint}/batch`, {
      data: { ids }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Batch delete failed');
  }
};

// Export the configured axios instance for custom calls
export default api;
