# Authentication System - Ensek-SAS

## Overview

The authentication system for Ensek-SAS has been updated to use a backend API with MongoDB (or MockDB as fallback) instead of localStorage. The system now supports:

- Secure password hashing using bcrypt
- JWT-based authentication
- Role-based authorization (user/admin)
- Persistent sessions
- Fallback to in-memory database when MongoDB is unavailable

## Troubleshooting

### 401 Unauthorized Error When Logging In

If you're experiencing a 401 Unauthorized error when trying to log in, try these steps:

1. **Check API URL Configuration**:
   - Make sure the baseURL in `apiService.js` is set to `http://localhost:5000/api` or your correct backend URL
   - Ensure Vite's proxy configuration is correct in `vite.config.js`

2. **Create Test Users**:
   - Run `cd server && npm run create-test-user` to create test users
   - Use the test credentials:
     - User: email=user@test.com, password=user123
     - Admin: email=admin@test.com, password=admin123

3. **Start Both Servers**:
   - Use the `quick-start.bat` script to start everything correctly

4. **Check Server Logs**:
   - Look at the console output from the backend server for any errors

5. **CORS Issues**:
   - If you see CORS errors, make sure the frontend is properly configured to talk to the backend

### Quick Start

For the easiest setup, simply run the `quick-start.bat` script which will:
1. Create test users
2. Start the backend server
3. Start the frontend development server
4. Display login credentials

## Key Components

### Backend Components

- `authController.js`: Handles user registration, login, and profile fetching
- `userModel.js`: Defines the User schema and handles password hashing
- `authMiddleware.js`: Verifies JWT tokens and extracts user information
- `mockDb.js`: Provides a fallback database when MongoDB is unavailable
- `db.js`: Manages database connections with fallback mechanism

### Frontend Components

- `useAuth.jsx`: A custom hook that provides authentication functions to components
- `Register.jsx` (client): Handles client user registration
- `Register.jsx` (admin): Handles administrator registration
- `ClientLogin.jsx`: Handles client login
- `Login.jsx` (admin): Handles administrator login
- `ProtectedRoute.jsx`: Prevents unauthorized access to protected routes
- `apiService.js`: Manages API calls with token handling

## Authentication Flow

1. **Registration**:
   - User submits registration form
   - Frontend validates form data
   - Registration data sent to API
   - Backend validates data and checks for existing users
   - Password is hashed
   - User is saved to database
   - JWT token is generated and returned

2. **Login**:
   - User submits login form
   - Frontend validates form data
   - Login data sent to API
   - Backend validates credentials
   - JWT token is generated and returned
   - Token is stored in localStorage

3. **Authentication**:
   - JWT token is included in API request headers
   - Backend middleware validates token
   - User is identified from token
   - Request is processed with user context

4. **Protected Routes**:
   - `ProtectedRoute` component checks for user and role
   - Redirects to login if no user or inadequate permissions
   - Renders protected component if authorized

## Testing

The authentication system can be tested using the `testAuth.js` script:

```bash
cd server
node testAuth.js
```

## Development Environment

The system is designed to work with or without a MongoDB connection. If MongoDB is unavailable, it will automatically fall back to an in-memory database (MockDB) for development purposes.

## API Endpoints

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login a user
- `GET /api/auth/profile`: Get the current user's profile (protected)
- `GET /api/health`: Check API and database health

## Authentication Data Model

```
User {
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: String (user or admin),
  phone: String (optional),
  address: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```
