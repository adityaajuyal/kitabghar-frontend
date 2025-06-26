// ========================================
// AXIOS BEST PRACTICES AND ERROR HANDLING
// ========================================

import axios from 'axios';
import { toast } from 'react-toastify';

// ========================================
// 1. ENVIRONMENT-BASED CONFIGURATION
// ========================================

const createApiInstance = () => {
  const baseURL = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_PROD_API_URL 
    : process.env.REACT_APP_DEV_API_URL || 'http://localhost:5000/api';

  const instance = axios.create({
    baseURL,
    timeout: process.env.NODE_ENV === 'production' ? 30000 : 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  return instance;
};

const api = createApiInstance();

// ========================================
// 2. ADVANCED REQUEST INTERCEPTOR
// ========================================

api.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add timestamp
    config.headers['X-Requested-At'] = new Date().toISOString();

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Headers:', config.headers);
      console.log('Data:', config.data);
      console.log('Params:', config.params);
      console.groupEnd();
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// ========================================
// 3. ADVANCED RESPONSE INTERCEPTOR
// ========================================

api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`);
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.log('Headers:', response.headers);
      console.groupEnd();
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // ========================================
    // TOKEN REFRESH LOGIC
    // ========================================
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/auth/refresh', {
            refreshToken
          });

          const newToken = response.data.token;
          localStorage.setItem('adminToken', newToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        handleAuthFailure();
        return Promise.reject(refreshError);
      }
    }

    // ========================================
    // ERROR HANDLING BY STATUS CODE
    // ========================================
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    switch (status) {
      case 400:
        toast.error(`Bad Request: ${message}`);
        break;
      case 401:
        toast.error('Session expired. Please login again.');
        handleAuthFailure();
        break;
      case 403:
        toast.error('Access denied. Insufficient permissions.');
        break;
      case 404:
        toast.error('Resource not found.');
        break;
      case 409:
        toast.error(`Conflict: ${message}`);
        break;
      case 422:
        toast.error(`Validation Error: ${message}`);
        break;
      case 429:
        toast.error('Too many requests. Please wait and try again.');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      case 502:
      case 503:
      case 504:
        toast.error('Service unavailable. Please try again later.');
        break;
      default:
        if (error.code === 'ECONNABORTED') {
          toast.error('Request timeout. Please check your connection.');
        } else if (error.code === 'ERR_NETWORK') {
          toast.error('Network error. Please check your connection.');
        } else {
          toast.error(`An error occurred: ${message}`);
        }
    }

    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.group('❌ Response Error');
      console.error('Status:', status);
      console.error('Message:', message);
      console.error('Full Error:', error);
      console.groupEnd();
    }

    return Promise.reject(error);
  }
);

// ========================================
// 4. AUTHENTICATION HELPERS
// ========================================

const handleAuthFailure = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  localStorage.removeItem('refreshToken');
  
  // Redirect to login page
  window.location.href = '/login';
};

// ========================================
// 5. RETRY MECHANISM
// ========================================

const retryRequest = async (requestFunc, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFunc();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, i);
      console.warn(`Request failed, retrying in ${waitTime}ms... (${i + 1}/${maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// ========================================
// 6. CACHE IMPLEMENTATION
// ========================================

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// ========================================
// 7. API WRAPPER WITH ADVANCED FEATURES
// ========================================

export const apiWrapper = {
  // GET with caching
  get: async (url, config = {}) => {
    const cacheKey = `GET_${url}_${JSON.stringify(config.params || {})}`;
    
    // Check cache first
    if (!config.skipCache) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        console.log('📁 Returning cached data for:', url);
        return cached;
      }
    }

    const response = await api.get(url, config);
    
    // Cache successful responses
    if (response.status === 200 && !config.skipCache) {
      setCachedData(cacheKey, response.data);
    }
    
    return response.data;
  },

  // POST with retry
  post: async (url, data, config = {}) => {
    const requestFunc = () => api.post(url, data, config);
    const response = await retryRequest(requestFunc, config.maxRetries);
    return response.data;
  },

  // PUT with optimistic updates
  put: async (url, data, config = {}) => {
    const response = await api.put(url, data, config);
    
    // Clear related cache entries
    const urlPattern = url.split('/')[0];
    for (const [key] of cache) {
      if (key.includes(urlPattern)) {
        cache.delete(key);
      }
    }
    
    return response.data;
  },

  // DELETE with cache invalidation
  delete: async (url, config = {}) => {
    const response = await api.delete(url, config);
    
    // Clear all cache entries for this resource
    const resourceId = url.split('/').pop();
    for (const [key] of cache) {
      if (key.includes(resourceId)) {
        cache.delete(key);
      }
    }
    
    return response.data;
  }
};

// ========================================
// 8. UPLOAD WITH PROGRESS AND CANCEL
// ========================================

export const uploadWithProgress = (file, onProgress, onCancel) => {
  const formData = new FormData();
  formData.append('file', file);

  const cancelTokenSource = axios.CancelToken.source();
  
  if (onCancel) {
    onCancel(() => cancelTokenSource.cancel('Upload cancelled by user'));
  }

  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      if (onProgress) onProgress(percentCompleted);
    },
    cancelToken: cancelTokenSource.token
  });
};

// ========================================
// 9. BATCH REQUESTS
// ========================================

export const batchRequests = async (requests) => {
  try {
    const responses = await Promise.allSettled(requests.map(req => 
      api({
        method: req.method || 'GET',
        url: req.url,
        data: req.data,
        params: req.params
      })
    ));

    return responses.map((response, index) => ({
      index,
      success: response.status === 'fulfilled',
      data: response.status === 'fulfilled' ? response.value.data : null,
      error: response.status === 'rejected' ? response.reason : null
    }));
  } catch (error) {
    console.error('Batch request failed:', error);
    throw error;
  }
};

// ========================================
// 10. REAL-TIME NOTIFICATIONS (SSE)
// ========================================

export const subscribeToNotifications = (onMessage, onError) => {
  const eventSource = new EventSource(`${api.defaults.baseURL}/notifications`);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('Failed to parse SSE message:', error);
    }
  };

  eventSource.onerror = (error) => {
    console.error('SSE connection error:', error);
    if (onError) onError(error);
  };

  // Return cleanup function
  return () => eventSource.close();
};

// ========================================
// EXPORT CONFIGURED INSTANCE
// ========================================

export default api;
