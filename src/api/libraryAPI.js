import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      // Redirect to login if needed
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Books API
export const booksAPI = {
  // Get all books
  getAllBooks: async (params = {}) => {
    try {
      const response = await api.get('/books', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch books' };
    }
  },

  // Get single book by ID
  getBookById: async (id) => {
    try {
      const response = await api.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch book' };
    }
  },

  // Add new book
  addBook: async (bookData) => {
    try {
      const response = await api.post('/books', bookData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add book' };
    }
  },

  // Update book
  updateBook: async (id, bookData) => {
    try {
      const response = await api.put(`/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update book' };
    }
  },

  // Update book stock
  updateStock: async (id, stockData) => {
    try {
      const response = await api.patch(`/books/${id}/stock`, stockData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update stock' };
    }
  },

  // Delete book
  deleteBook: async (id) => {
    try {
      const response = await api.delete(`/books/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete book' };
    }
  },

  // Search books
  searchBooks: async (query) => {
    try {
      const response = await api.get(`/books/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search books' };
    }
  },

  // Get available books only
  getAvailableBooks: async () => {
    try {
      const response = await api.get('/books/available');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch available books' };
    }
  }
};

// Issues API
export const issuesAPI = {
  // Issue a book
  issueBook: async (issueData) => {
    try {
      const response = await api.post('/issues', issueData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to issue book' };
    }
  },

  // Get all issued books
  getIssuedBooks: async (params = {}) => {
    try {
      const response = await api.get('/issues', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch issued books' };
    }
  },

  // Get single issue record
  getIssueById: async (id) => {
    try {
      const response = await api.get(`/issues/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch issue record' };
    }
  },

  // Return a book
  returnBook: async (issueId) => {
    try {
      const response = await api.patch(`/issues/${issueId}/return`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to return book' };
    }
  },

  // Get user's active issues
  getUserIssues: async (erpId) => {
    try {
      const response = await api.get(`/issues/user/${erpId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user issues' };
    }
  },

  // Get overdue books
  getOverdueBooks: async () => {
    try {
      const response = await api.get('/issues/overdue');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch overdue books' };
    }
  },

  // Update issue record
  updateIssue: async (id, updateData) => {
    try {
      const response = await api.put(`/issues/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update issue record' };
    }
  },

  // Delete issue record
  deleteIssue: async (id) => {
    try {
      const response = await api.delete(`/issues/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete issue record' };
    }
  }
};

// Admin API
export const adminAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch dashboard stats' };
    }
  },

  // Get dashboard overview
  getDashboardOverview: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch dashboard overview' };
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch users' };
    }
  },

  // Get admin issues with filters
  getAdminIssues: async (params = {}) => {
    try {
      const response = await api.get('/admin/issues', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch admin issues' };
    }
  },

  // Get monthly statistics
  getMonthlyStats: async (year) => {
    try {
      const response = await api.get(`/admin/monthly-stats?year=${year}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch monthly stats' };
    }
  },

  // Get overdue books (admin view)
  getAdminOverdueBooks: async () => {
    try {
      const response = await api.get('/admin/overdue');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch overdue books' };
    }
  }
};

// Export the api instance for direct use if needed
export default api;
