import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

interface TokenPayload {
  userId: string;
  role: string;
}

/**
 * Generate JWT token
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

