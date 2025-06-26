<<<<<<< HEAD
# Kitabghar Frontend - Library Management System

## 🚀 React Frontend for Library Management System

A modern, responsive web application for managing library operations, built with React.js and featuring a beautiful UI with admin dashboard capabilities.

## ✨ Features

- 📚 **Book Management**: Add, edit, delete, and search books
- 👥 **User Management**: Handle user registrations and profiles
- 📖 **Issue/Return System**: Track book lending and returns
- 📊 **Admin Dashboard**: Comprehensive analytics and statistics
- 🔐 **Authentication**: Secure JWT-based admin login
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 🔍 **Search & Filter**: Advanced book search capabilities
- 📱 **Mobile Responsive**: Works perfectly on all devices

## 🛠️ Tech Stack

- **Framework**: React.js 18
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Notifications**: React Toastify
- **State Management**: React Context API
- **Build Tool**: Create React App

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── api/
│   │   ├── authAPI.js          # Authentication API calls
│   │   └── libraryAPI.js       # Library operations API
│   ├── components/
│   │   ├── ProtectedRoute.jsx  # Route protection
│   │   └── Layout/             # Layout components
│   ├── context/
│   │   └── AuthContext.js      # Authentication context
│   ├── hooks/
│   │   └── useApiHooks.js      # Custom API hooks
│   ├── pages/
│   │   ├── Admin/
│   │   │   └── AdminDashboard.jsx
│   │   ├── Auth/
│   │   │   └── LoginPage.jsx
│   │   └── User/
│   │       └── UserPage.jsx
│   ├── styles/
│   │   ├── App.css
│   │   └── index.css
│   ├── App.js                  # Main App component
│   └── index.js                # Entry point
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Backend API running (see backend repository)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kitabghar-frontend.git
   cd kitabghar-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```bash
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Visit `http://localhost:3000` to see the application.

## 🔐 Admin Access

### Default Credentials
- **Username**: `admin`
- **Password**: `admin123`

### Login Process
1. Navigate to `/login` or click the login button
2. Enter the admin credentials
3. You'll be redirected to the admin dashboard

## 📱 Pages & Features

### 🏠 Home Page (`/`)
- Welcome message
- Navigation to different sections
- Quick stats overview

### 🔐 Login Page (`/login`)
- Secure admin authentication
- Form validation
- Error handling
- Redirect after successful login

### 👨‍💼 Admin Dashboard (`/admin`)
- **Dashboard Overview**: Statistics and charts
- **Book Management**: 
  - View all books in a responsive table
  - Add new books with form validation
  - Edit existing books
  - Delete books with confirmation
  - Search and filter books
- **Issue Management**:
  - View all issued books
  - Issue books to users
  - Handle book returns
  - Track due dates and overdue books
- **User Management**:
  - View registered users
  - User activity tracking
- **Reports**: Generate various reports

### 👤 User Page (`/user`)
- Book catalog browsing
- Search functionality
- User profile management

## 🎨 UI Components

### Dashboard Cards
- Statistics cards with icons
- Real-time data updates
- Responsive grid layout

### Data Tables
- Sortable columns
- Pagination
- Search functionality
- Action buttons (Edit, Delete, View)

### Forms
- React Hook Form integration
- Real-time validation
- Error messages
- Loading states

### Modals
- Add/Edit book modals
- Confirmation dialogs
- Responsive design

## 🔗 API Integration

The frontend communicates with the backend API using Axios with the following features:

- **Base URL Configuration**: Environment-based API URLs
- **Request Interceptors**: Automatic token attachment
- **Response Interceptors**: Error handling and token refresh
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during API calls

### API Endpoints Used
```javascript
// Authentication
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/verify

// Books
GET /api/books
POST /api/books
PUT /api/books/:id
DELETE /api/books/:id

// Issues
GET /api/issues
POST /api/issues
PATCH /api/issues/:id/return

// Admin
GET /api/admin/dashboard
GET /api/admin/users
```

## 🛡️ Security Features

- **Protected Routes**: Authentication required for admin pages
- **JWT Token Management**: Secure token storage and validation
- **Input Validation**: Client-side form validation
- **XSS Protection**: Sanitized inputs and outputs
- **CSRF Protection**: Token-based request validation

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🎨 Styling

### Tailwind CSS Classes Used
- **Layout**: `container`, `mx-auto`, `px-4`
- **Grid**: `grid`, `grid-cols-1`, `md:grid-cols-2`, `lg:grid-cols-3`
- **Colors**: `bg-blue-500`, `text-white`, `border-gray-300`
- **Spacing**: `p-4`, `m-2`, `space-y-4`
- **Typography**: `text-lg`, `font-bold`, `text-center`

### Custom CSS
- Component-specific styles in `src/styles/`
- CSS modules for component isolation
- Animation and transition effects

## 🚀 Deployment

### Deploy to Vercel

1. **Prepare for deployment**
   ```bash
   npm run build
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Connect to Vercel**
   - Visit [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables
   - Deploy!

### Environment Variables for Production
```bash
REACT_APP_API_URL=https://your-backend-api.onrender.com/api
REACT_APP_ENV=production
```

## 📋 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🔧 Configuration

### Axios Configuration
```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Router Configuration
```javascript
// Protected routes require authentication
<Route path="/admin" element={
  <ProtectedRoute>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

## 🧪 Testing

- Unit tests with React Testing Library
- Integration tests for API calls
- E2E tests with Cypress (optional)

```bash
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Check if backend is running
   - Verify API URL in environment variables
   - Check CORS configuration

2. **Authentication Problems**
   - Clear browser storage
   - Check JWT token expiration
   - Verify credentials

3. **Build Failures**
   - Clear node_modules and reinstall
   - Check for linting errors
   - Verify all dependencies

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Links

- [Backend Repository](https://github.com/yourusername/kitabghar-backend)
- [Live Demo](https://your-app-name.vercel.app)
- [API Documentation](https://your-backend-api.onrender.com/api)

## 🆘 Support

For support, email support@kitabghar.com or create an issue on GitHub.

---

**Built with ❤️ using React.js**
=======
# kitabghar-frontend
React Frontend for Kitabghar Library Management System
>>>>>>> 45141f0a074f6f237677fc569bc264d825f58f41
