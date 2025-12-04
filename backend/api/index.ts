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

// Add debug logging
console.log('Vercel handler initialized');
console.log('API_PREFIX:', process.env.API_PREFIX || '/api/v1');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

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
    } as mongoose.ConnectOptions);
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Export the Express app as a serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`[Handler] ${req.method} ${req.url}`);
  
  // Allow test endpoint to work without MongoDB
  const isTestEndpoint = req.url === '/api/test' || req.url?.endsWith('/api/test');
  
  try {
    // Ensure MongoDB connection is established (skip for test endpoint)
    if (!isTestEndpoint) {
      try {
        await connectToDatabase();
        console.log('[Handler] MongoDB connected');
      } catch (error) {
        console.error('[Handler] Failed to connect to MongoDB:', error);
        return res.status(500).json({ 
          success: false,
          message: 'Database connection failed',
          error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
        });
      }
    } else {
      console.log('[Handler] Skipping MongoDB connection for test endpoint');
    }

    // Cast Vercel types to Express types for compatibility
    // Vercel's types are compatible at runtime, but TypeScript needs explicit casting
    // Using 'any' here because @vercel/node types are compatible with Express at runtime
    const expressReq = req as any;
    const expressRes = res as any;

    // Wrap Express app call in a Promise to ensure Vercel waits for response
    return new Promise<void>((resolve, reject) => {
      let resolved = false;
      
      const cleanup = () => {
        if (!resolved) {
          resolved = true;
        }
      };

      try {
        // Handle the request with Express app
        app(expressReq, expressRes);

        // Wait for response to finish before resolving
        expressRes.on('finish', () => {
          console.log(`[Handler] Response finished: ${expressRes.statusCode}`);
          cleanup();
          resolve();
        });

        // Handle errors that occur during response handling
        expressRes.on('error', (error: Error) => {
          console.error('[Handler] Response error:', error);
          cleanup();
          if (!expressRes.headersSent) {
            expressRes.status(500).json({
              success: false,
              message: 'Internal server error',
            });
          }
          reject(error);
        });

        // Timeout fallback - if response doesn't finish within 30 seconds, resolve anyway
        setTimeout(() => {
          if (!resolved) {
            console.warn('[Handler] Response timeout - resolving anyway');
            cleanup();
            resolve();
          }
        }, 30000);
      } catch (error) {
        console.error('[Handler] Error in handler:', error);
        cleanup();
        if (!expressRes.headersSent) {
          expressRes.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
          });
        }
        reject(error);
      }
    });
  } catch (error) {
    console.error('[Handler] Fatal error in handler:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
      });
    }
  }
}
