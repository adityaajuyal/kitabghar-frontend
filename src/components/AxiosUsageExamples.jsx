import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { booksAPI, authAPI, issuesAPI, apiCall } from '../api/axiosExamples';

// ========================================
// REACT COMPONENT EXAMPLES WITH AXIOS
// ========================================

const AxiosUsageExamples = () => {
  // State management
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newBook, setNewBook] = useState({ title: '', author: '', quantity: 1 });

  // ========================================
  // 1. FETCHING DATA (GET REQUEST)
  // ========================================
  
  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await booksAPI.getBooks();
      setBooks(data.books || []);
      toast.success(`Loaded ${data.books?.length || 0} books`);
    } catch (error) {
      setError(error.message);
      toast.error(`Failed to load books: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Alternative using apiCall utility
  const fetchBooksWithUtility = async () => {
    setLoading(true);
    const result = await apiCall(booksAPI.getBooks);
    
    if (result.success) {
      setBooks(result.data.books || []);
      toast.success('Books loaded successfully');
    } else {
      setError(result.error);
      toast.error(result.error);
    }
    setLoading(false);
  };

  // ========================================
  // 2. CREATING DATA (POST REQUEST)
  // ========================================
  
  const handleCreateBook = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const createdBook = await booksAPI.createBook(newBook);
      
      // Update local state
      setBooks(prevBooks => [...prevBooks, createdBook.book]);
      
      // Reset form
      setNewBook({ title: '', author: '', quantity: 1 });
      
      toast.success('Book created successfully!');
    } catch (error) {
      toast.error(`Failed to create book: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // 3. UPDATING DATA (PUT REQUEST)
  // ========================================
  
  const handleUpdateBook = async (bookId, updatedData) => {
    try {
      const updatedBook = await booksAPI.updateBook(bookId, updatedData);
      
      // Update local state
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book._id === bookId ? updatedBook.book : book
        )
      );
      
      toast.success('Book updated successfully!');
    } catch (error) {
      toast.error(`Failed to update book: ${error.message}`);
    }
  };

  // ========================================
  // 4. DELETING DATA (DELETE REQUEST)
  // ========================================
  
  const handleDeleteBook = async (bookId) => {
    // Show confirmation
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await booksAPI.deleteBook(bookId);
      
      // Update local state
      setBooks(prevBooks => prevBooks.filter(book => book._id !== bookId));
      
      toast.success('Book deleted successfully!');
    } catch (error) {
      toast.error(`Failed to delete book: ${error.message}`);
    }
  };

  // ========================================
  // 5. SEARCH WITH DEBOUNCING
  // ========================================
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch(searchTerm);
      } else {
        fetchBooks(); // Reset to all books
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = async (query) => {
    setLoading(true);
    try {
      const data = await booksAPI.searchBooks(query);
      setBooks(data.books || []);
    } catch (error) {
      toast.error(`Search failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // 6. AUTHENTICATION EXAMPLE
  // ========================================
  
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(credentials);
      
      // Redirect or update app state
      toast.success('Login successful!');
      
      // Example: Redirect to dashboard
      window.location.href = '/admin/dashboard';
      
    } catch (error) {
      toast.error(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  // ========================================
  // 7. ISSUE BOOK EXAMPLE
  // ========================================
  
  const handleIssueBook = async (bookId, userId) => {
    try {
      const issueData = {
        bookId,
        userId,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days
      };

      const response = await issuesAPI.issueBook(issueData);
      
      toast.success('Book issued successfully!');
      
      // Refresh books list to update quantities
      fetchBooks();
      
    } catch (error) {
      toast.error(`Failed to issue book: ${error.message}`);
    }
  };

  // ========================================
  // 8. BATCH OPERATIONS EXAMPLE
  // ========================================
  
  const [selectedBooks, setSelectedBooks] = useState([]);
  
  const handleBatchDelete = async () => {
    if (selectedBooks.length === 0) {
      toast.warning('Please select books to delete');
      return;
    }

    if (!window.confirm(`Delete ${selectedBooks.length} selected books?`)) {
      return;
    }

    try {
      await batchDelete(selectedBooks, 'books');
      
      // Update local state
      setBooks(prevBooks => 
        prevBooks.filter(book => !selectedBooks.includes(book._id))
      );
      
      setSelectedBooks([]);
      toast.success(`${selectedBooks.length} books deleted successfully!`);
      
    } catch (error) {
      toast.error(`Batch delete failed: ${error.message}`);
    }
  };

  // ========================================
  // 9. FILE UPLOAD EXAMPLE
  // ========================================
  
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const response = await uploadFile(file, setUploadProgress);
      toast.success('File uploaded successfully!');
      console.log('Upload response:', response);
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploadProgress(0);
    }
  };

  // ========================================
  // LOAD DATA ON COMPONENT MOUNT
  // ========================================
  
  useEffect(() => {
    fetchBooks();
  }, []);

  // ========================================
  // RENDER COMPONENT
  // ========================================
  
  return (
    <div className="axios-examples">
      <h2>Axios Usage Examples</h2>
      
      {/* Error Display */}
      {error && (
        <div className="error-message" style={{color: 'red', padding: '10px', background: '#ffe6e6'}}>
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && <div className="loading">Loading...</div>}

      {/* Search */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add Book Form */}
      <form onSubmit={handleCreateBook} className="add-book-form">
        <h3>Add New Book</h3>
        <input
          type="text"
          placeholder="Title"
          value={newBook.title}
          onChange={(e) => setNewBook({...newBook, title: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Author"
          value={newBook.author}
          onChange={(e) => setNewBook({...newBook, author: e.target.value})}
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newBook.quantity}
          onChange={(e) => setNewBook({...newBook, quantity: parseInt(e.target.value)})}
          min="1"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Book'}
        </button>
      </form>

      {/* Books List */}
      <div className="books-list">
        <h3>Books ({books.length})</h3>
        {books.map(book => (
          <div key={book._id} className="book-item">
            <input
              type="checkbox"
              checked={selectedBooks.includes(book._id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedBooks([...selectedBooks, book._id]);
                } else {
                  setSelectedBooks(selectedBooks.filter(id => id !== book._id));
                }
              }}
            />
            <span>{book.title} by {book.author} (Qty: {book.quantity})</span>
            <button onClick={() => handleUpdateBook(book._id, {...book, quantity: book.quantity + 1})}>
              +1
            </button>
            <button onClick={() => handleDeleteBook(book._id)}>
              Delete
            </button>
            <button onClick={() => handleIssueBook(book._id, 'user123')}>
              Issue
            </button>
          </div>
        ))}
      </div>

      {/* Batch Operations */}
      {selectedBooks.length > 0 && (
        <div className="batch-operations">
          <button onClick={handleBatchDelete}>
            Delete Selected ({selectedBooks.length})
          </button>
        </div>
      )}

      {/* File Upload */}
      <div className="file-upload">
        <h3>Upload File</h3>
        <input type="file" onChange={handleFileUpload} />
        {uploadProgress > 0 && (
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{width: `${uploadProgress}%`}}
            >
              {uploadProgress}%
            </div>
          </div>
        )}
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="login-form">
        <h3>Login</h3>
        <input
          type="text"
          placeholder="Username"
          value={credentials.username}
          onChange={(e) => setCredentials({...credentials, username: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </form>
    </div>
  );
};

export default AxiosUsageExamples;
