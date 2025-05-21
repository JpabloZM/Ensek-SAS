// mockDb.js - Mock database for development without MongoDB
// This file provides a simple in-memory data store for development and testing

class MockDB {
  constructor() {
    this.users = [];
    this.serviceRequests = [];
    this.inventoryItems = [];
    this.counter = {
      users: 1,
      serviceRequests: 1,
      inventoryItems: 1,
    };
    
    // Add default admin user
    this.users.push({
      _id: this._generateId('users'),
      name: 'Admin User',
      email: 'admin@test.com',
      password: '$2b$10$7T8wUXy0aOgwoteSjdL.ounBW32S6jXcmVlPgY6UMUK3Qxh7DGRbS', // admin123
      role: 'admin',
      phone: '123-456-7890',
      address: '123 Admin St',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // Add default test user
    this.users.push({
      _id: this._generateId('users'),
      name: 'Test User',
      email: 'test@example.com',
      password: '$2b$10$MBJyYQ.vLngLSjPvnS64x.YX5oDr0xyHn8oB5MXlMFURlX97PVnxe', // user123
      role: 'user',
      phone: '987-654-3210',
      address: '456 User Ave',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  _generateId(collection) {
    return (this.counter[collection]++).toString();
  }
  
  // User methods
  async findUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }
  
  async findUserById(id) {
    return this.users.find(user => user._id === id);
  }
  
  async createUser(userData) {
    const user = {
      _id: this._generateId('users'),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }
  
  async getAllUsers() {
    return [...this.users];
  }
  
  async updateUser(id, userData) {
    const index = this.users.findIndex(user => user._id === id);
    if (index === -1) return null;
    
    this.users[index] = {
      ...this.users[index],
      ...userData,
      updatedAt: new Date(),
    };
    
    return this.users[index];
  }
  
  async deleteUser(id) {
    const index = this.users.findIndex(user => user._id === id);
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    return true;
  }
  
  // Service Request methods
  async createServiceRequest(requestData) {
    const request = {
      _id: this._generateId('serviceRequests'),
      ...requestData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.serviceRequests.push(request);
    return request;
  }
  
  async getAllServiceRequests() {
    return [...this.serviceRequests];
  }
  
  async getServiceRequestById(id) {
    return this.serviceRequests.find(request => request._id === id);
  }
  
  async updateServiceRequest(id, requestData) {
    const index = this.serviceRequests.findIndex(request => request._id === id);
    if (index === -1) return null;
    
    this.serviceRequests[index] = {
      ...this.serviceRequests[index],
      ...requestData,
      updatedAt: new Date(),
    };
    
    return this.serviceRequests[index];
  }
  
  // Inventory methods
  async createInventoryItem(itemData) {
    const item = {
      _id: this._generateId('inventoryItems'),
      ...itemData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.inventoryItems.push(item);
    return item;
  }
  
  async getAllInventoryItems() {
    return [...this.inventoryItems];
  }
  
  async getInventoryItemById(id) {
    return this.inventoryItems.find(item => item._id === id);
  }
  
  async updateInventoryItem(id, itemData) {
    const index = this.inventoryItems.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    this.inventoryItems[index] = {
      ...this.inventoryItems[index],
      ...itemData,
      updatedAt: new Date(),
    };
    
    return this.inventoryItems[index];
  }
  
  async deleteInventoryItem(id) {
    const index = this.inventoryItems.findIndex(item => item._id === id);
    if (index === -1) return false;
    
    this.inventoryItems.splice(index, 1);
    return true;
  }
}

// Singleton instance
const mockDb = new MockDB();

export { mockDb };
