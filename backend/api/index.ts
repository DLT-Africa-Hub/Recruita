/**
 * Vercel Serverless Function Entry Point
 * This file wraps the Express app for Vercel's serverless environment
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from '../app';

// Load environment variables
dotenv.config();

// Cache MongoDB connection for serverless
let cachedConnection: typeof mongoose | null = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    const conn = await mongoose.connect(MONGODB_URI, {
      // Optimize for serverless
      maxPoolSize: 1, // Limit connections in serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Export the Express app as a serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure MongoDB connection is established
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return res.status(500).json({ error: 'Database connection failed' });
  }

  // Cast Vercel types to Express types for compatibility
  // Vercel's types are compatible at runtime, but TypeScript needs explicit casting
  // Using 'any' here because @vercel/node types are compatible with Express at runtime
  const expressReq = req as any;
  const expressRes = res as any;

  // Wrap Express app call in a Promise to ensure Vercel waits for response
  return new Promise<void>((resolve, reject) => {
    // Handle the request with Express app
    app(expressReq, expressRes);

    // Wait for response to finish before resolving
    expressRes.on('finish', () => {
      resolve();
    });

    // Handle errors that occur during response handling
    expressRes.on('error', (error: Error) => {
      reject(error);
    });
  });
}
