import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { TokenPayload, generateToken } from './auth';

const JWT_SECRET: string = process.env.JWT_SECRET ?? 'development_secret';

/**
 * Refresh a JWT token.
 * This function expects a refresh token in the request body and returns a new access token.
 */
export function refreshToken(req: Request, res: Response): Response {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as TokenPayload;
    // Exclude iat and exp from payload
    const { iat, exp, ...payload } = decoded;
    // Generate a new access token with a short expiration (e.g., 1 hour)
    const newAccessToken = generateToken(payload, '1h');
    return res.json({ accessToken: newAccessToken });
  } catch (error: any) {
    return res.status(401).json({ error: 'Invalid refresh token', details: error.message });
  }
}

/**
 * Express middleware for handling token refresh requests.
 */
export function tokenRefreshHandler(req: Request, res: Response, next: NextFunction): void {
  refreshToken(req, res);
}
