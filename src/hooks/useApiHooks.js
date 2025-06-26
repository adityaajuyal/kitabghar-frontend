import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

// ========================================
// CUSTOM HOOKS FOR API CALLS
// ========================================

// ========================================
// 1. useApi - Generic API hook
// ========================================
export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef(false);

  const {
    immediate = true,
    onSuccess,
    onError,
    showToast = true
  } = options;

  const execute = useCallback(async (...args) => {
    if (cancelRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      
      if (!cancelRef.current) {
        setData(result);
        if (onSuccess) onSuccess(result);
        if (showToast) toast.success('Operation completed successfully');
      }
      
      return result;
    } catch (err) {
      if (!cancelRef.current) {
        setError(err.message || 'An error occurred');
        if (onError) onError(err);
        if (showToast) toast.error(err.message || 'Operation failed');
      }
      throw err;
    } finally {
      if (!cancelRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction, onSuccess, onError, showToast]);

  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      cancelRef.current = true;
    };
  }, dependencies);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute
  };
};

// ========================================
// 2. useBooks - Specific hook for books
// ========================================
export const useBooks = (params = {}) => {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooks = useCallback(async (searchParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await booksAPI.getBooks({ ...params, ...searchParams });
      setBooks(response.books || []);
      setPagination({
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        total: response.total || 0
      });
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to fetch books: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const addBook = useCallback(async (bookData) => {
    try {
      const response = await booksAPI.createBook(bookData);
      setBooks(prev => [response.book, ...prev]);
      toast.success('Book added successfully');
      return response.book;
    } catch (err) {
      toast.error(`Failed to add book: ${err.message}`);
      throw err;
    }
  }, []);

  const updateBook = useCallback(async (id, bookData) => {
    try {
      const response = await booksAPI.updateBook(id, bookData);
      setBooks(prev => 
        prev.map(book => book._id === id ? response.book : book)
      );
      toast.success('Book updated successfully');
      return response.book;
    } catch (err) {
      toast.error(`Failed to update book: ${err.message}`);
      throw err;
    }
  }, []);

  const deleteBook = useCallback(async (id) => {
    try {
      await booksAPI.deleteBook(id);
      setBooks(prev => prev.filter(book => book._id !== id));
      toast.success('Book deleted successfully');
    } catch (err) {
      toast.error(`Failed to delete book: ${err.message}`);
      throw err;
    }
  }, []);

  const searchBooks = useCallback(async (query) => {
    await fetchBooks({ search: query });
  }, [fetchBooks]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return {
    books,
    pagination,
    loading,
    error,
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
    searchBooks,
    refetch: fetchBooks
  };
};

// ========================================
// 3. useAuth - Authentication hook
// ========================================
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await authAPI.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success('Login successful');
      return response;
    } catch (err) {
      toast.error(`Login failed: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error(`Logout failed: ${err.message}`);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authAPI.verifyToken();
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth
  };
};

// ========================================
// 4. useLocalStorage - Persistent state
// ========================================
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

// ========================================
// 5. useDebounce - Debounced values
// ========================================
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ========================================
// 6. usePagination - Pagination logic
// ========================================
export const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  return {
    currentData,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
};

// ========================================
// 7. useAsync - Async operations
// ========================================
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction(...args);
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    execute,
    status,
    data,
    error,
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error'
  };
};

// ========================================
// USAGE EXAMPLES
// ========================================

/*
// Example 1: Using useBooks hook
const BooksList = () => {
  const { books, loading, error, addBook, deleteBook, searchBooks } = useBooks();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      searchBooks(debouncedSearch);
    }
  }, [debouncedSearch, searchBooks]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search books..."
      />
      {books.map(book => (
        <div key={book._id}>
          {book.title} - {book.author}
          <button onClick={() => deleteBook(book._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

// Example 2: Using useApi hook
const Dashboard = () => {
  const { data: stats, loading, error, refetch } = useApi(
    adminAPI.getDashboardStats,
    [], // dependencies
    { 
      immediate: true,
      onSuccess: (data) => console.log('Stats loaded:', data),
      showToast: false
    }
  );

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {stats && <div>Total Books: {stats.totalBooks}</div>}
    </div>
  );
};

// Example 3: Using useAuth hook
const LoginForm = () => {
  const { login, loading } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials);
      // Redirect or update UI
    } catch (error) {
      // Error already handled by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={credentials.username}
        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
      />
      <input 
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
*/
