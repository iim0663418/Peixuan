import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserService } from '../services/userService';
import { logger } from '../utils/logger';

export class AuthController {
  private userService = new UserService();

  async register(req: Request, res: Response) {
    try {
      const { email, password, name, timezone } = req.body;
      
      // 檢查用戶是否已存在
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: '用戶已存在' });
      }

      // 創建新用戶
      const user = await this.userService.create({
        email,
        password,
        name,
        timezone,
        membershipLevel: 'anonymous'
      });

      // 生成JWT
      const token = this.generateToken(user.id);
      
      res.status(201).json({
        message: '註冊成功',
        user: { id: user.id, email: user.email, name: user.name },
        token
      });
    } catch (error) {
      logger.error('註冊失敗:', error);
      res.status(500).json({ error: '註冊失敗' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      const user = await this.userService.findByEmail(email);
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: '帳號或密碼錯誤' });
      }

      const token = this.generateToken(user.id);
      
      res.json({
        message: '登入成功',
        user: { id: user.id, email: user.email, name: user.name },
        token
      });
    } catch (error) {
      logger.error('登入失敗:', error);
      res.status(500).json({ error: '登入失敗' });
    }
  }

  async logout(req: Request, res: Response) {
    // JWT無狀態，前端刪除token即可
    res.json({ message: '登出成功' });
  }

  async getProfile(req: Request, res: Response) {
    try {
      const user = await this.userService.findById(req.user.id);
      res.json({ user });
    } catch (error) {
      logger.error('獲取用戶資料失敗:', error);
      res.status(500).json({ error: '獲取用戶資料失敗' });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const updatedUser = await this.userService.update(req.user.id, req.body);
      res.json({ message: '更新成功', user: updatedUser });
    } catch (error) {
      logger.error('更新用戶資料失敗:', error);
      res.status(500).json({ error: '更新失敗' });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      // 實現refresh token邏輯
      const newToken = this.generateToken(req.user.id);
      res.json({ token: newToken });
    } catch (error) {
      res.status(401).json({ error: 'Token無效' });
    }
  }

  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );
  }
}