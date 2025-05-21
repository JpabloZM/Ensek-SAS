# ENSEK-SAS Backend

This is the backend server for the ENSEK-SAS application, a pest control and gardening service company.

## Features

- User authentication (login/register) with JWT
- Role-based access control (Admin/User)
- Service request management
- Inventory management
- RESTful API
- Development mode with in-memory database (MockDB) when MongoDB is not available

## Technology Stack

- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT Authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB installed locally or MongoDB Atlas account
- Git

## Installation

1. Clone the repository (if you haven't already)
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root of the server directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ensek
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

## Running the Server

1. Start the server in development mode:
   ```
   npm run dev
   ```
2. Start the server in production mode:
   ```
   npm start
   ```

## Development without MongoDB

This server includes a fallback mechanism for development without MongoDB. If MongoDB is not available, it will automatically use an in-memory database (MockDB) that provides basic functionality for testing and development.

The MockDB includes:
- Pre-seeded user accounts (admin@test.com/admin123 and test@example.com/user123)
- In-memory storage for service requests and inventory
- Complete API functionality without requiring a database

To check if the server is using MockDB, make a GET request to:
```
GET /api/health
```

## Database Seeding

To populate the database with sample data:
```
npm run seed
```

This will create:
- Admin user (email: admin@test.com, password: admin123)
- Regular user (email: test@example.com, password: user123)
- Sample service requests
- Sample inventory items

## API Endpoints

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

## Authentication

The API uses JWT tokens for authentication. When logging in or registering, you'll receive a token which should be included in subsequent requests as a Bearer token in the Authorization header:

```
Authorization: Bearer your_token_here
```
