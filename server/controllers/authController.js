// Authentication controller
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { isUsingMockDB } from '../config/db.js';
import { mockDb } from '../config/mockDb.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Check if user exists
    let userExists;
    
    if (isUsingMockDB()) {
      userExists = await mockDb.findUserByEmail(email);
    } else {
      userExists = await User.findOne({ email });
    }

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    let user;
    
    // Create user
    if (isUsingMockDB()) {
      // In MockDB, we need to hash the password manually
      const bcrypt = await import('bcrypt');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      user = await mockDb.createUser({
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        phone,
        address,
      });
    } else {
      user = await User.create({
        name,
        email,
        password,
        role: role || 'user', // Default to user if role not specified
        phone,
        address,
      });
    }

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user;
    let isPasswordMatch = false;
    
    // Check for user email
    if (isUsingMockDB()) {
      user = await mockDb.findUserByEmail(email);
      
      if (user) {
        // In MockDB, we need to compare the password manually
        const bcrypt = await import('bcrypt');
        isPasswordMatch = await bcrypt.compare(password, user.password);
      }
    } else {
      user = await User.findOne({ email }).select('+password');
      
      if (user) {
        isPasswordMatch = await user.matchPassword(password);
      }
    }

    if (user && isPasswordMatch) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    let user;
    
    if (isUsingMockDB()) {
      user = await mockDb.findUserById(req.user._id);
    } else {
      user = await User.findById(req.user._id);
    }

    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};
