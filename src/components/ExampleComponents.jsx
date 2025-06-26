import React, { useState, useEffect } from 'react';
import { booksAPI, issuesAPI } from '../api/libraryAPI';
import { useBooks, useIssues } from '../hooks/useLibrary';
import { toast } from 'react-toastify';

// Example 1: Using the API directly
const BooksListDirect = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getAllBooks();
      setBooks(response.books);
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (bookData) => {
    try {
      await booksAPI.addBook(bookData);
      toast.success('Book added successfully!');
      fetchBooks(); // Refresh the list
    } catch (error) {
      toast.error(error.message || 'Failed to add book');
    }
  };

  const handleUpdateStock = async (bookId, newStock) => {
    try {
      await booksAPI.updateStock(bookId, { availableQuantity: newStock });
      toast.success('Stock updated successfully!');
      fetchBooks(); // Refresh the list
    } catch (error) {
      toast.error(error.message || 'Failed to update stock');
    }
  };

  if (loading) return <div>Loading books...</div>;

  return (
    <div>
      <h2>Books List (Direct API)</h2>
      {books.map(book => (
        <div key={book._id} className="book-item">
          <h3>{book.title}</h3>
          <p>by {book.author}</p>
          <p>Available: {book.availableQuantity}</p>
          <button 
            onClick={() => handleUpdateStock(book._id, book.availableQuantity + 1)}
          >
            Add Stock
          </button>
        </div>
      ))}
    </div>
  );
};

// Example 2: Using custom hooks
const BooksListWithHooks = () => {
  const { books, loading, addBook, updateStock } = useBooks();

  useEffect(() => {
    // Books are automatically fetched when the hook is used
  }, []);

  const handleAddNewBook = async () => {
    const newBook = {
      title: 'New Book',
      author: 'New Author',
      isbn: '1234567890',
      category: 'Fiction',
      totalQuantity: 5
    };

    try {
      await addBook(newBook);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (loading) return <div>Loading books...</div>;

  return (
    <div>
      <h2>Books List (With Hooks)</h2>
      <button onClick={handleAddNewBook}>Add New Book</button>
      {books.map(book => (
        <div key={book._id} className="book-item">
          <h3>{book.title}</h3>
          <p>by {book.author}</p>
          <p>Available: {book.availableQuantity}</p>
          <button 
            onClick={() => updateStock(book._id, { availableQuantity: book.availableQuantity + 1 })}
          >
            Add Stock
          </button>
        </div>
      ))}
    </div>
  );
};

// Example 3: Issue Book Component
const IssueBookForm = () => {
  const { issueBook } = useIssues();
  const [formData, setFormData] = useState({
    bookId: '',
    userName: '',
    phone: '',
    erpId: '',
    issueDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const issueData = {
        ...formData,
        expectedReturnDate: calculateReturnDate(formData.issueDate)
      };
      
      await issueBook(issueData);
      
      // Reset form
      setFormData({
        bookId: '',
        userName: '',
        phone: '',
        erpId: '',
        issueDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const calculateReturnDate = (issueDate) => {
    const date = new Date(issueDate);
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Issue Book</h2>
      
      <input
        type="text"
        placeholder="Book ID"
        value={formData.bookId}
        onChange={(e) => setFormData({...formData, bookId: e.target.value})}
        required
      />
      
      <input
        type="text"
        placeholder="User Name"
        value={formData.userName}
        onChange={(e) => setFormData({...formData, userName: e.target.value})}
        required
      />
      
      <input
        type="tel"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        required
      />
      
      <input
        type="text"
        placeholder="ERP ID"
        value={formData.erpId}
        onChange={(e) => setFormData({...formData, erpId: e.target.value})}
        required
      />
      
      <input
        type="date"
        value={formData.issueDate}
        onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
        required
      />
      
      <button type="submit">Issue Book</button>
    </form>
  );
};

// Example 4: Issued Books List
const IssuedBooksList = () => {
  const { issues, loading, returnBook, fetchIssues } = useIssues();

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleReturnBook = async (issueId) => {
    try {
      await returnBook(issueId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (loading) return <div>Loading issued books...</div>;

  return (
    <div>
      <h2>Issued Books</h2>
      {issues.map(issue => (
        <div key={issue._id} className="issue-item">
          <h3>{issue.bookId?.title || 'Unknown Book'}</h3>
          <p>Issued to: {issue.userName}</p>
          <p>ERP ID: {issue.erpId}</p>
          <p>Issue Date: {new Date(issue.issueDate).toLocaleDateString()}</p>
          <p>Due Date: {new Date(issue.expectedReturnDate).toLocaleDateString()}</p>
          <p>Status: {issue.status}</p>
          
          {issue.status !== 'returned' && (
            <button onClick={() => handleReturnBook(issue._id)}>
              Return Book
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// Example 5: Search Books
const SearchBooks = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await booksAPI.searchBooks(searchQuery);
      setSearchResults(response.books);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Search Books</h2>
      <div>
        <input
          type="text"
          placeholder="Search books by title, author, or ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      <div>
        {searchResults.map(book => (
          <div key={book._id} className="book-item">
            <h3>{book.title}</h3>
            <p>by {book.author}</p>
            <p>ISBN: {book.isbn}</p>
            <p>Available: {book.availableQuantity}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export {
  BooksListDirect,
  BooksListWithHooks,
  IssueBookForm,
  IssuedBooksList,
  SearchBooks
};
