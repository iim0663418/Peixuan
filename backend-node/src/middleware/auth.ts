import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET ?? 'development_secret';

export interface TokenPayload {
  userId: string;
  role: string;
  features: string[];
  iat: number;
  exp: number;
}

/**
 * Generate a JSON Web Token for a user.
 * @param payload - The token payload excluding iat and exp.
 * @param expiresIn - Token expiration (e.g., '1h', '7d').
 */
export function generateToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
  expiresIn: string = '1h'
): string {
  // @ts-ignore
  const options: SignOptions = { expiresIn: expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Express middleware to validate JWT and optionally check feature access.
 * @param requiredFeatures - List of features required for this route.
 */
export function validateToken(requiredFeatures: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      // Feature-based access control
      if (requiredFeatures.length > 0) {
        const hasAccess = requiredFeatures.every(feature =>
          decoded.features.includes(feature)
        );
        if (!hasAccess) {
          return res.status(403).json({ error: 'Feature access denied' });
        }
      }
      (req as any).user = decoded;
      next();
    } catch (error: any) {
      return res.status(401).json({ error: 'Invalid or expired token', details: error.message });
    }
  };
}
