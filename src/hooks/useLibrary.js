import { useState, useEffect } from 'react';
import { booksAPI, issuesAPI, adminAPI } from '../api/libraryAPI';
import { toast } from 'react-toastify';

// Custom hook for books management
export const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooks = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await booksAPI.getAllBooks(params);
      setBooks(response.books || []);
      return response;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to fetch books');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (bookData) => {
    try {
      setLoading(true);
      const response = await booksAPI.addBook(bookData);
      toast.success('Book added successfully!');
      await fetchBooks(); // Refresh the list
      return response;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to add book');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async (id, bookData) => {
    try {
      setLoading(true);
      const response = await booksAPI.updateBook(id, bookData);
      toast.success('Book updated successfully!');
      await fetchBooks(); // Refresh the list
      return response;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to update book');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id, stockData) => {
    try {
      const response = await booksAPI.updateStock(id, stockData);
      toast.success('Stock updated successfully!');
      await fetchBooks(); // Refresh the list
      return response;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to update stock');
      throw err;
    }
  };

  const deleteBook = async (id) => {
    try {
      setLoading(true);
      const response = await booksAPI.deleteBook(id);
      toast.success('Book deleted successfully!');
      await fetchBooks(); // Refresh the list
      return response;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to delete book');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    books,
    loading,
    error,
    fetchBooks,
    addBook,
    updateBook,
    updateStock,
    deleteBook
  };
};

// Custom hook for issues management
export const useIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIssues = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await issuesAPI.getIssuedBooks(params);
      setIssues(response.issues || []);
      return response;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to fetch issued books');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const issueBook = async (issueData) => {
    try {
      setLoading(true);
      const response = await issuesAPI.issueBook(issueData);
      toast.success(`Book "${issueData.bookTitle || 'Unknown'}" issued successfully!`);
      await fetchIssues(); // Refresh the list
      return response;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to issue book');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const returnBook = async (issueId) => {
    try {
      setLoading(true);
      const response = await issuesAPI.returnBook(issueId);
      toast.success('Book returned successfully!');
      await fetchIssues(); // Refresh the list
      return response;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to return book');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserIssues = async (erpId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await issuesAPI.getUserIssues(erpId);
      return response.issues || [];
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to fetch user issues');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    issues,
    loading,
    error,
    fetchIssues,
    issueBook,
    returnBook,
    getUserIssues
  };
};

// Custom hook for admin dashboard
export const useAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, dashboardResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getDashboardOverview()
      ]);
      
      setStats(statsResponse.stats || {});
      setDashboardData(dashboardResponse.dashboard || {});
      
      return { stats: statsResponse.stats, dashboard: dashboardResponse.dashboard };
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to fetch dashboard data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      return response.users || [];
    } catch (err) {
      toast.error(err.message || 'Failed to fetch users');
      throw err;
    }
  };

  const fetchMonthlyStats = async (year) => {
    try {
      const response = await adminAPI.getMonthlyStats(year);
      return response.monthlyStats || [];
    } catch (err) {
      toast.error(err.message || 'Failed to fetch monthly statistics');
      throw err;
    }
  };

  return {
    dashboardData,
    stats,
    loading,
    error,
    fetchDashboardData,
    fetchUsers,
    fetchMonthlyStats
  };
};
