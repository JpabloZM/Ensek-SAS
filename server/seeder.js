// Database seeder script
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import ServiceRequest from './models/serviceRequestModel.js';
import InventoryItem from './models/inventoryModel.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ensek')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Sample users
const users = [
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    phone: '123-456-7890',
    address: '123 Admin St',
  },
  {
    name: 'Test User',
    email: 'test@example.com',
    password: 'user123',
    role: 'user',
    phone: '987-654-3210',
    address: '456 User Ave',
  },
];

// Sample service requests
const serviceRequests = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-123-4567',
    address: '789 Main St, City',
    serviceType: 'pest-control',
    description: 'Need pest control service for roaches in kitchen area',
    preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'pending',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '555-987-6543',
    address: '123 Oak St, Town',
    serviceType: 'gardening',
    description: 'Need gardening service for front yard',
    preferredDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    status: 'confirmed',
  },
];

// Sample inventory items
const inventoryItems = [
  {
    name: 'Pesticide A',
    category: 'chemical',
    quantity: 50,
    unitOfMeasure: 'ml',
    description: 'General purpose pesticide for household pests',
    minimumStock: 10,
    price: 25.99,
  },
  {
    name: 'Garden Shears',
    category: 'tool',
    quantity: 15,
    unitOfMeasure: 'unidad',
    description: 'Professional garden shears for pruning',
    minimumStock: 5,
    price: 45.50,
  },
  {
    name: 'Worker Uniform',
    category: 'uniform',
    quantity: 20,
    unitOfMeasure: 'unidad',
    description: 'Standard worker uniform with company logo',
    minimumStock: 8,
    price: 35.00,
  },
];

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await ServiceRequest.deleteMany();
    await InventoryItem.deleteMany();

    console.log('Data cleared...');    // Create users with plaintext passwords - the User model will hash them
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        // Let the pre-save hook in the User model handle password hashing
        return await User.create(user);
      })
    );

    console.log(`${createdUsers.length} users created`);

    // Create service requests with user references
    const adminUser = createdUsers[0];
    const regularUser = createdUsers[1];

    serviceRequests[0].user = regularUser._id;
    await ServiceRequest.insertMany(serviceRequests);
    console.log(`${serviceRequests.length} service requests created`);

    // Create inventory items
    await InventoryItem.insertMany(inventoryItems);
    console.log(`${inventoryItems.length} inventory items created`);

    console.log('Data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
