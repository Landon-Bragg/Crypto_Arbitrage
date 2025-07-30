import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { storage } from './storage';

// JWT secret - in production, this should be set via environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    // Removed isPremium
  };
}

// Create JWT token
export function createToken(user: { id: number; username: string; email: string }): string {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      email: user.email
      // Removed isPremium
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token middleware
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = decoded;
    next();
  });
}

// Optional authentication - doesn't fail if no token
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (!err) {
        req.user = decoded;
      }
    });
  }
  
  next();
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Rate limiting for all users (single policy)
export const userRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 4, // 4 requests per minute for all users
  message: { message: 'Rate limit exceeded. Please wait before making more requests.' },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
});

// Dynamic rate limit middleware (example: 4 requests per minute per IP)
export const dynamicRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 4, // 4 requests per minute per IP
  message: { message: 'Rate limit exceeded. Please wait before making more requests.' },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
});