# 🚀 React Frontend + Express Backend Integration Guide

## 📋 Table of Contents
1. [CORS Setup in Express](#cors-setup)
2. [Axios Configuration](#axios-configuration)
3. [API Integration Patterns](#api-integration)
4. [Error Handling](#error-handling)
5. [Authentication Flow](#authentication)
6. [Best Practices](#best-practices)
7. [Common Issues & Solutions](#troubleshooting)

---

## 🔧 CORS Setup in Express {#cors-setup}

### Basic CORS Setup
```javascript
// app.js
const cors = require('cors');

// Simple CORS (allows all origins - only for development)
app.use(cors());
```

### Production-Ready CORS Configuration
```javascript
// app.js
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',     // React dev server
      'http://localhost:3001',     // Alternative port
      'https://yourdomain.com',    // Production frontend
      'https://www.yourdomain.com' // Production frontend with www
    ];
    
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,              // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization'
  ]
};

app.use(cors(corsOptions));
```

### Environment-Based CORS
```javascript
// app.js
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
};

app.use(cors(corsOptions));
```

---

## ⚛️ Axios Configuration {#axios-configuration}

### Basic Axios Setup
```javascript
// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
```

### Advanced Axios Configuration
```javascript
// src/api/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

// Create instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🔌 API Integration Patterns {#api-integration}

### 1. Service Layer Pattern
```javascript
// src/services/bookService.js
import api from '../api/api';

export const bookService = {
  async getAll(params = {}) {
    const response = await api.get('/books', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/books', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/books/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  }
};
```

### 2. Custom Hook Pattern
```javascript
// src/hooks/useBooks.js
import { useState, useEffect } from 'react';
import { bookService } from '../services/bookService';

export const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await bookService.getAll();
      setBooks(data.books);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return { books, loading, error, refetch: fetchBooks };
};
```

### 3. React Component Usage
```javascript
// src/components/BooksList.jsx
import React from 'react';
import { useBooks } from '../hooks/useBooks';

const BooksList = () => {
  const { books, loading, error, refetch } = useBooks();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {books.map(book => (
        <div key={book._id}>
          <h3>{book.title}</h3>
          <p>Author: {book.author}</p>
          <p>Quantity: {book.quantity}</p>
        </div>
      ))}
    </div>
  );
};

export default BooksList;
```

---

## 🚨 Error Handling {#error-handling}

### Frontend Error Handling
```javascript
// src/utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data.message || 'Server error';
    
    switch (status) {
      case 400:
        return `Bad Request: ${message}`;
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return message;
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred.';
  }
};
```

### Backend Error Handling
```javascript
// backend/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
```

---

## 🔐 Authentication Flow {#authentication}

### 1. Login Process
```javascript
// Frontend - Login Component
const handleLogin = async (credentials) => {
  try {
    const response = await authService.login(credentials);
    
    // Store token
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Update app state
    setUser(response.user);
    setIsAuthenticated(true);
    
    // Redirect
    navigate('/dashboard');
  } catch (error) {
    setError(error.message);
  }
};
```

### 2. Protected Routes
```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
```

### 3. Auth Context
```javascript
// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

---

## 💡 Best Practices {#best-practices}

### 1. Environment Variables
```bash
# .env (Frontend)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_PROD_API_URL=https://api.yourdomain.com

# .env (Backend)
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/kitabghar
JWT_SECRET=your-secret-key
```

### 2. API Response Structure
```javascript
// Consistent API response format
const successResponse = {
  success: true,
  data: {...},
  message: "Operation successful"
};

const errorResponse = {
  success: false,
  message: "Error description",
  errors: {...}  // Optional validation errors
};
```

### 3. Loading States
```javascript
// Component with loading states
const Component = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.get('/data');
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <Spinner />}
      {error && <ErrorMessage message={error} />}
      {data && <DataDisplay data={data} />}
    </div>
  );
};
```

### 4. Request Cancellation
```javascript
// Cancel requests on component unmount
useEffect(() => {
  const cancelToken = axios.CancelToken.source();

  const fetchData = async () => {
    try {
      const response = await api.get('/data', {
        cancelToken: cancelToken.token
      });
      setData(response.data);
    } catch (error) {
      if (!axios.isCancel(error)) {
        setError(error.message);
      }
    }
  };

  fetchData();

  return () => {
    cancelToken.cancel('Component unmounted');
  };
}, []);
```

---

## 🔧 Common Issues & Solutions {#troubleshooting}

### 1. CORS Errors
```
Access to XMLHttpRequest at 'http://localhost:5000/api/books' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
```javascript
// Backend: Add proper CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### 2. Network Errors
```
Error: Network Error
```

**Solutions:**
- Check if backend server is running
- Verify API URL in frontend
- Check firewall/proxy settings
- Ensure correct port numbers

### 3. Authentication Issues
```
Error: Request failed with status code 401
```

**Solutions:**
```javascript
// Check token expiration
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

// Implement token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      try {
        const newToken = await refreshToken();
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api.request(error.config);
      } catch {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### 4. Request Timeout
```
Error: timeout of 10000ms exceeded
```

**Solution:**
```javascript
// Increase timeout for specific requests
const api = axios.create({
  timeout: 30000, // 30 seconds
});

// Or per request
api.get('/data', { timeout: 60000 });
```

---

## 📝 Quick Setup Checklist

- [ ] Install axios: `npm install axios`
- [ ] Install CORS: `npm install cors` (backend)
- [ ] Configure CORS in Express app
- [ ] Create axios instance with base configuration
- [ ] Set up request/response interceptors
- [ ] Implement error handling
- [ ] Create service layer for API calls
- [ ] Set up authentication flow
- [ ] Test with different HTTP methods
- [ ] Handle loading states in components
- [ ] Implement proper error boundaries

---

## 🚀 Your Current Setup Status

✅ **CORS**: Configured in your Express app  
✅ **Axios**: Set up with interceptors  
✅ **Authentication**: JWT-based auth working  
✅ **Error Handling**: Basic error handling in place  
✅ **API Structure**: RESTful endpoints implemented  

**Next Steps:**
1. Test all CRUD operations through frontend
2. Implement proper loading states
3. Add comprehensive error handling
4. Set up automated testing
5. Optimize for production deployment

---

*This guide covers the complete integration between your React frontend and Express backend. All examples are production-ready and follow modern best practices.*
