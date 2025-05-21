# ENSEK-SAS Full Stack Application

This repository contains a full-stack application for ENSEK-SAS, a pest control and gardening service company. The project consists of:

- React frontend (Vite) with client and admin sections
- Node.js backend with Express.js and MongoDB
- RESTful API
- JWT Authentication system with role-based access control

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas connection)
- npm or yarn

## Installation

1. Clone the repository
2. Install frontend dependencies:
   ```
   npm install
   ```
3. Install backend dependencies:
   ```
   cd server
   npm install
   ```

## Configuration

1. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ensek
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

## Development

1. Start the backend server:
   ```
   cd server
   npm run dev
   ```
2. In a separate terminal, start the frontend development server:
   ```
   npm run dev
   ```

3. Alternatively, use the provided start script to launch both servers at once:
   - On Windows: `start-dev.bat` or `start-app.bat`
   - On Unix/Mac: `./start.sh` (make it executable first with `chmod +x start.sh`)

4. The application will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Development without MongoDB

The application now supports a development mode without MongoDB by using an in-memory database. This is useful for quick development and testing.

If MongoDB is not available, the system will automatically use the MockDB implementation, which provides basic database functionality in memory.

To test the API status:
```
GET http://localhost:5000/api/health
```

This will return information about the server status, including whether it's using the MockDB.

## Authentication System

The application includes a complete authentication system with the following features:

- Secure password hashing with bcrypt
- JWT-based authentication
- Role-based access control (user and admin roles)
- Protected routes for both client and admin sections
- API endpoint protection with middleware
- In-memory authentication for development without MongoDB
- Persistent sessions with localStorage

### Authentication Testing

To test the authentication system, run:
```
cd server
node testAuth.js
```
or use the provided test scripts:
- Windows: `test-auth-flow.bat`
- Unix/Mac: `./test-auth-flow.sh`

## Database Seeding

To populate the database with sample data:
```
cd server
npm run seed
```

This will create:
- Admin user (email: admin@test.com, password: admin123)
- Regular user (email: test@example.com, password: user123)
- Sample service requests
- Sample inventory items

## API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile (requires authentication)

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Services
- `POST /api/services/request` - Create a service request (public)
- `GET /api/services/requests` - Get all service requests (admin only)
- `GET /api/services/requests/:id` - Get service request by ID
- `PUT /api/services/requests/:id/status` - Update service request status (admin only)

### Inventory (Admin only)
- `POST /api/inventory` - Create a new inventory item
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:id` - Get inventory item by ID
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
