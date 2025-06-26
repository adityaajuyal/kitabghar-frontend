import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Book, User, Phone, Calendar, Hash, AlertCircle, CheckCircle } from 'lucide-react';
import { booksAPI, issuesAPI } from '../../api/libraryAPI';

const UserPage = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  // Fetch available books
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      // Get all books
      const response = await booksAPI.getAllBooks();
      setBooks(response.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  // Filter books based on search term
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle book selection for issuing
  const handleBookSelect = (book) => {
    if (book.availableQuantity > 0) {
      setSelectedBook(book);
    } else {
      toast.warning('This book is currently out of stock');
    }
  };

  // Handle form submission for book issuing
  const onSubmit = async (data) => {
    if (!selectedBook) {
      toast.error('Please select a book to issue');
      return;
    }

    setIsSubmitting(true);
    try {
      const issueData = {
        bookId: selectedBook._id,
        userName: data.userName,
        phone: data.phone,
        erpId: data.erpId,
        issueDate: data.issueDate,
        expectedReturnDate: calculateReturnDate(data.issueDate)
      };

      // Issue a book
      await issuesAPI.issueBook(issueData);
      
      // Get all issued books
      await issuesAPI.getIssuedBooks();

      toast.success(`Book "${selectedBook.title}" issued successfully!`);
      reset();
      setSelectedBook(null);
      fetchBooks(); // Refresh books to update quantities
    } catch (error) {
      console.error('Error issuing book:', error);
      toast.error(error.message || 'Failed to issue book');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate expected return date (14 days from issue date)
  const calculateReturnDate = (issueDate) => {
    const date = new Date(issueDate);
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  };

  // Get today's date for min date validation
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📚 Kitabghar Library
          </h1>
          <p className="text-lg text-gray-600">
            Browse and issue books from our collection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Books List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Book className="mr-2" size={24} />
                  Available Books
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Book className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </div>
              </div>

              <div className="grid gap-4">
                {filteredBooks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Book size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No books found</p>
                  </div>
                ) : (
                  filteredBooks.map((book) => (
                    <div
                      key={book._id}
                      className={`border rounded-lg p-4 transition-all cursor-pointer ${
                        selectedBook?._id === book._id
                          ? 'border-blue-500 bg-blue-50'
                          : book.availableQuantity > 0
                          ? 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          : 'border-red-200 bg-red-50 opacity-75 cursor-not-allowed'
                      }`}
                      onClick={() => handleBookSelect(book)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {book.title}
                          </h3>
                          <p className="text-gray-600 mb-2">by {book.author}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>ISBN: {book.isbn}</span>
                            <span>Category: {book.category}</span>
                          </div>
                          {book.description && (
                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                              {book.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            book.availableQuantity > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {book.availableQuantity > 0 ? (
                              <>
                                <CheckCircle size={16} className="mr-1" />
                                {book.availableQuantity} Available
                              </>
                            ) : (
                              <>
                                <AlertCircle size={16} className="mr-1" />
                                Out of Stock
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Issue Book Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="mr-2" size={24} />
                Issue Book
              </h2>

              {selectedBook ? (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-1">Selected Book:</h3>
                  <p className="text-blue-800 font-semibold">{selectedBook.title}</p>
                  <p className="text-blue-600 text-sm">by {selectedBook.author}</p>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-600 text-center">
                    Please select a book from the list to issue
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* User Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User size={16} className="inline mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...register('userName', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                  {errors.userName && (
                    <p className="text-red-500 text-sm mt-1">{errors.userName.message}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone size={16} className="inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Please enter a valid 10-digit phone number'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* ERP ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Hash size={16} className="inline mr-1" />
                    ERP ID
                  </label>
                  <input
                    type="text"
                    {...register('erpId', {
                      required: 'ERP ID is required',
                      pattern: {
                        value: /^[A-Za-z0-9]+$/,
                        message: 'ERP ID should contain only letters and numbers'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your ERP ID"
                  />
                  {errors.erpId && (
                    <p className="text-red-500 text-sm mt-1">{errors.erpId.message}</p>
                  )}
                </div>

                {/* Issue Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar size={16} className="inline mr-1" />
                    Issue Date
                  </label>
                  <input
                    type="date"
                    {...register('issueDate', {
                      required: 'Issue date is required',
                      min: {
                        value: getTodayDate(),
                        message: 'Issue date cannot be in the past'
                      }
                    })}
                    min={getTodayDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.issueDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.issueDate.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!selectedBook || isSubmitting || selectedBook?.availableQuantity === 0}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    !selectedBook || isSubmitting || selectedBook?.availableQuantity === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Issuing Book...
                    </div>
                  ) : (
                    'Issue Book'
                  )}
                </button>

                {selectedBook?.availableQuantity === 0 && (
                  <p className="text-red-500 text-sm text-center mt-2">
                    This book is currently out of stock
                  </p>
                )}
              </form>

              {/* Note */}
              <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Books must be returned within 14 days from the issue date.
                  Late returns may incur penalties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
