import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  role: string;
}

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user info to request object
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default-secret'
    ) as JwtPayload;

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Role-based authorization middleware
 * @param allowedRoles - Array of allowed roles
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};

