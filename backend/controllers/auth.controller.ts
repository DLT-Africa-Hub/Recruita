import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.model';
import { generateToken } from '../utils/jwt.utils';

/**
 * Register a new user (graduate, company, or admin)
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      res.status(400).json({ message: 'Email, password, and role are required' });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

