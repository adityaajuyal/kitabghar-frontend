import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
adminApiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }
);

export const adminAPI = {
  // Dashboard stats
  getDashboardStats: async () => {
    return adminApiClient.get('/admin/stats');
  },

  // Dashboard overview
  getDashboardOverview: async () => {
    return adminApiClient.get('/admin/overview');
  },

  // Get all users
  getAllUsers: async () => {
    return adminApiClient.get('/admin/users');
  },

  // Add a new book
  addBook: async (bookData) => {
    return adminApiClient.post('/books', bookData);
  },

  // Update book stock
  updateBookStock: async (bookId, stockData) => {
    return adminApiClient.put(`/books/${bookId}/stock`, stockData);
  },

  // Update book details
  updateBook: async (bookId, bookData) => {
    return adminApiClient.put(`/books/${bookId}`, bookData);
  },

  // Delete a book
  deleteBook: async (bookId) => {
    return adminApiClient.delete(`/books/${bookId}`);
  },

  // Get issued books with admin details
  getIssuedBooksAdmin: async () => {
    return adminApiClient.get('/admin/issued-books');
  },

  // Mark book as returned
  returnBook: async (issueId) => {
    return adminApiClient.put(`/admin/return-book/${issueId}`);
  }
};

export default adminAPI;
