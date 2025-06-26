import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  Book, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Eye,
  X,
  LogOut
} from 'lucide-react';
import { booksAPI, issuesAPI, adminAPI } from '../../api/libraryAPI';
import { AuthContext } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [books, setBooks] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showEditBookModal, setShowEditBookModal] = useState(false);
  const [showIssueDetailsModal, setShowIssueDetailsModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerBook,
    handleSubmit: handleBookSubmit,
    reset: resetBookForm,
    formState: { errors: bookErrors }
  } = useForm();

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    setValue: setEditValue,
    formState: { errors: editErrors }
  } = useForm();

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [booksRes, issuesRes, statsRes] = await Promise.all([
        booksAPI.getAllBooks(),
        issuesAPI.getIssuedBooks(),
        adminAPI.getDashboardStats()
      ]);

      setBooks(booksRes.books || []);
      setIssuedBooks(issuesRes.issues || []);
      setDashboardStats(statsRes.stats || {});
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (data) => {
    setIsSubmitting(true);
    try {
      await booksAPI.addBook({
        ...data,
        totalQuantity: parseInt(data.totalQuantity),
        availableQuantity: parseInt(data.totalQuantity), // Initially all books are available
        publicationYear: parseInt(data.publicationYear)
      });

      toast.success('Book added successfully!');
      resetBookForm();
      setShowAddBookModal(false);
      fetchDashboardData();
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error(error.message || 'Failed to add book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBook = async (data) => {
    if (!selectedBook) return;

    setIsSubmitting(true);
    try {
      await booksAPI.updateBook(selectedBook._id, {
        ...data,
        totalQuantity: parseInt(data.totalQuantity),
        publicationYear: parseInt(data.publicationYear)
      });

      toast.success('Book updated successfully!');
      resetEditForm();
      setShowEditBookModal(false);
      setSelectedBook(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error(error.message || 'Failed to update book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      await booksAPI.deleteBook(bookId);
      toast.success('Book deleted successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error(error.message || 'Failed to delete book');
    }
  };

  const handleUpdateStock = async (bookId, newStock) => {
    try {
      await booksAPI.updateStock(bookId, {
        availableQuantity: parseInt(newStock)
      });
      toast.success('Stock updated successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error(error.message || 'Failed to update stock');
    }
  };

  const handleReturnBook = async (issueId) => {
    try {
      await issuesAPI.returnBook(issueId);
      toast.success('Book returned successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error(error.message || 'Failed to return book');
    }
  };

  const openEditModal = (book) => {
    setSelectedBook(book);
    setEditValue('title', book.title);
    setEditValue('author', book.author);
    setEditValue('isbn', book.isbn);
    setEditValue('category', book.category);
    setEditValue('description', book.description || '');
    setEditValue('publisher', book.publisher || '');
    setEditValue('publicationYear', book.publicationYear || '');
    setEditValue('totalQuantity', book.totalQuantity);
    setEditValue('language', book.language || '');
    setEditValue('location', book.location || '');
    setShowEditBookModal(true);
  };

  const viewIssueDetails = (issue) => {
    setSelectedIssue(issue);
    setShowIssueDetailsModal(true);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Filter functions
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIssues = issuedBooks.filter(issue =>
    issue.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.erpId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.bookId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIssueStatusColor = (issue) => {
    const now = new Date();
    const expectedReturn = new Date(issue.expectedReturnDate);
    
    if (issue.status === 'returned') return 'text-green-600 bg-green-100';
    if (now > expectedReturn) return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getIssueStatusText = (issue) => {
    const now = new Date();
    const expectedReturn = new Date(issue.expectedReturnDate);
    
    if (issue.status === 'returned') return 'Returned';
    if (now > expectedReturn) return 'Overdue';
    return 'Issued';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              📚 Admin Dashboard - Kitabghar
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'books', label: 'Manage Books', icon: Book },
              { id: 'issues', label: 'Issued Books', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="mr-2" size={20} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Book className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Books</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {dashboardStats.totalBooks || books.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Available Books</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {books.filter(book => book.availableQuantity > 0).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Issued Books</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {issuedBooks.filter(issue => issue.status !== 'returned').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Overdue Books</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {issuedBooks.filter(issue => {
                        const now = new Date();
                        const expectedReturn = new Date(issue.expectedReturnDate);
                        return issue.status !== 'returned' && now > expectedReturn;
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Book Issues</h3>
              <div className="space-y-4">
                {issuedBooks.slice(0, 5).map((issue) => (
                  <div key={issue._id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{issue.bookId?.title || 'Unknown Book'}</p>
                      <p className="text-sm text-gray-600">
                        Issued to: {issue.userName} ({issue.erpId})
                      </p>
                      <p className="text-xs text-gray-500">
                        Issue Date: {new Date(issue.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIssueStatusColor(issue)}`}>
                      {getIssueStatusText(issue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Books Management Tab */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Manage Books</h2>
              <button
                onClick={() => setShowAddBookModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="mr-2" size={20} />
                Add New Book
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>

            {/* Books Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBooks.map((book) => (
                      <tr key={book._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{book.title}</div>
                            <div className="text-sm text-gray-500">by {book.author}</div>
                            <div className="text-xs text-gray-400">ISBN: {book.isbn}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {book.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              max={book.totalQuantity}
                              defaultValue={book.availableQuantity}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                              onBlur={(e) => {
                                const newStock = parseInt(e.target.value);
                                if (newStock !== book.availableQuantity && newStock >= 0 && newStock <= book.totalQuantity) {
                                  handleUpdateStock(book._id, newStock);
                                }
                              }}
                            />
                            <span className="text-sm text-gray-500">/ {book.totalQuantity}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            book.availableQuantity > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {book.availableQuantity > 0 ? 'Available' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => openEditModal(book)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Issued Books Tab */}
        {activeTab === 'issues' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Issued Books</h2>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by user name, ERP ID, or book title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>

            {/* Issues Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Issue Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredIssues.map((issue) => (
                      <tr key={issue._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {issue.bookId?.title || 'Unknown Book'}
                            </div>
                            <div className="text-sm text-gray-500">
                              by {issue.bookId?.author || 'Unknown Author'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{issue.userName}</div>
                            <div className="text-sm text-gray-500">ERP: {issue.erpId}</div>
                            <div className="text-sm text-gray-500">📞 {issue.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(issue.issueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(issue.expectedReturnDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getIssueStatusColor(issue)}`}>
                            {getIssueStatusText(issue)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => viewIssueDetails(issue)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye size={16} />
                          </button>
                          {issue.status !== 'returned' && (
                            <button
                              onClick={() => handleReturnBook(issue._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Book</h3>
              <button
                onClick={() => setShowAddBookModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleBookSubmit(handleAddBook)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    {...registerBook('title', { required: 'Title is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter book title"
                  />
                  {bookErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{bookErrors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                  <input
                    type="text"
                    {...registerBook('author', { required: 'Author is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter author name"
                  />
                  {bookErrors.author && (
                    <p className="text-red-500 text-sm mt-1">{bookErrors.author.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
                  <input
                    type="text"
                    {...registerBook('isbn', { 
                      required: 'ISBN is required',
                      pattern: {
                        value: /^(?:\d{10}|\d{13})$/,
                        message: 'Please enter a valid 10 or 13 digit ISBN'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter ISBN"
                  />
                  {bookErrors.isbn && (
                    <p className="text-red-500 text-sm mt-1">{bookErrors.isbn.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    {...registerBook('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Mathematics', 'Literature', 'Philosophy', 'Arts', 'Business', 'Self-Help', 'Reference', 'Children', 'Other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {bookErrors.category && (
                    <p className="text-red-500 text-sm mt-1">{bookErrors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                  <input
                    type="text"
                    {...registerBook('publisher')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter publisher"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publication Year</label>
                  <input
                    type="number"
                    min="1000"
                    max={new Date().getFullYear()}
                    {...registerBook('publicationYear')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter publication year"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    {...registerBook('totalQuantity', { 
                      required: 'Total quantity is required',
                      min: { value: 1, message: 'Quantity must be at least 1' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter total quantity"
                  />
                  {bookErrors.totalQuantity && (
                    <p className="text-red-500 text-sm mt-1">{bookErrors.totalQuantity.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <input
                    type="text"
                    {...registerBook('language')}
                    defaultValue="English"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter language"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  {...registerBook('description')}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter book description"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  {...registerBook('location')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter shelf location"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Adding...' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditBookModal && selectedBook && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Book</h3>
              <button
                onClick={() => setShowEditBookModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit(handleEditBook)} className="space-y-4">
              {/* Similar form fields as Add Book Modal but with registerEdit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    {...registerEdit('title', { required: 'Title is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter book title"
                  />
                  {editErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{editErrors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                  <input
                    type="text"
                    {...registerEdit('author', { required: 'Author is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter author name"
                  />
                  {editErrors.author && (
                    <p className="text-red-500 text-sm mt-1">{editErrors.author.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    {...registerEdit('totalQuantity', { 
                      required: 'Total quantity is required',
                      min: { value: 1, message: 'Quantity must be at least 1' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter total quantity"
                  />
                  {editErrors.totalQuantity && (
                    <p className="text-red-500 text-sm mt-1">{editErrors.totalQuantity.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    {...registerEdit('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Mathematics', 'Literature', 'Philosophy', 'Arts', 'Business', 'Self-Help', 'Reference', 'Children', 'Other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {editErrors.category && (
                    <p className="text-red-500 text-sm mt-1">{editErrors.category.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditBookModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Updating...' : 'Update Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Details Modal */}
      {showIssueDetailsModal && selectedIssue && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Issue Details</h3>
              <button
                onClick={() => setShowIssueDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Book Information</h4>
                <p className="text-sm text-gray-600">Title: {selectedIssue.bookId?.title}</p>
                <p className="text-sm text-gray-600">Author: {selectedIssue.bookId?.author}</p>
                <p className="text-sm text-gray-600">ISBN: {selectedIssue.bookId?.isbn}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">User Information</h4>
                <p className="text-sm text-gray-600">Name: {selectedIssue.userName}</p>
                <p className="text-sm text-gray-600">ERP ID: {selectedIssue.erpId}</p>
                <p className="text-sm text-gray-600">Phone: {selectedIssue.phone}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Issue Information</h4>
                <p className="text-sm text-gray-600">Issue Date: {new Date(selectedIssue.issueDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Expected Return: {new Date(selectedIssue.expectedReturnDate).toLocaleDateString()}</p>
                {selectedIssue.actualReturnDate && (
                  <p className="text-sm text-gray-600">Actual Return: {new Date(selectedIssue.actualReturnDate).toLocaleDateString()}</p>
                )}
                <p className="text-sm text-gray-600">Status: 
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getIssueStatusColor(selectedIssue)}`}>
                    {getIssueStatusText(selectedIssue)}
                  </span>
                </p>
              </div>

              {selectedIssue.notes && (
                <div>
                  <h4 className="font-medium text-gray-900">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedIssue.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              {selectedIssue.status !== 'returned' && (
                <button
                  onClick={() => {
                    handleReturnBook(selectedIssue._id);
                    setShowIssueDetailsModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark as Returned
                </button>
              )}
              <button
                onClick={() => setShowIssueDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
