/**
 * Vercel Serverless Function Entry Point
 * Simplified version that directly exports the Express app
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

// Cache MongoDB connection for serverless
let cachedConnection: typeof mongoose | null = null;

// Lazy load app to catch initialization errors
let appInstance: any = null;

function getApp() {
  if (!appInstance) {
    try {
      appInstance = require('../app').default;
    } catch (error) {
      console.error('Failed to load Express app:', error);
      throw error;
    }
  }
  return appInstance;
}

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    const conn = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    } as mongoose.ConnectOptions);
    
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Simple handler that connects to DB and passes request to Express
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Get app instance (lazy load to catch initialization errors)
    const app = getApp();

    // Connect to MongoDB (skip for test endpoint)
    if (!req.url?.includes('/api/test') && !req.url?.includes('/health')) {
      try {
        await connectToDatabase();
      } catch (error) {
        console.error('MongoDB connection failed:', error);
        return res.status(500).json({ 
          success: false,
          message: 'Database connection failed',
          error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
        });
      }
    }

    // Wrap Express handler in a Promise to ensure Vercel waits
    return new Promise<void>((resolve, reject) => {
      try {
        // Handle request with Express
        app(req as any, res as any);
        
        // Resolve when response is finished
        res.on('finish', () => resolve());
        res.on('close', () => resolve());
        
        // Handle errors
        res.on('error', (error: Error) => {
          console.error('Response error:', error);
          reject(error);
        });
      } catch (error) {
        console.error('Handler error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
          });
        }
        reject(error);
      }
    });
  } catch (error) {
    console.error('Fatal handler error:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize application',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
      });
    }
  }
}
