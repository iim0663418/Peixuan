import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService';

interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '未提供認證Token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    const userService = new UserService();
    const user = await userService.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: '用戶不存在' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token無效' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
      const userService = new UserService();
      const user = await userService.findById(decoded.userId);
      req.user = user;
    }
    
    next();
  } catch (error) {
    // 可選認證，錯誤時繼續執行
    next();
  }
};

export const requireMembership = (level: 'member' | 'vip') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '需要登入' });
    }

    const userLevel = req.user.membershipLevel;
    const levels = ['anonymous', 'member', 'vip'];
    const requiredIndex = levels.indexOf(level);
    const userIndex = levels.indexOf(userLevel);

    if (userIndex < requiredIndex) {
      return res.status(403).json({ error: '權限不足' });
    }

    next();
  };
};