import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { logger } from '../utils/logger';

export class UserController {
  private userService = new UserService();

  async getCurrentUser(req: Request, res: Response) {
    try {
      const user = await this.userService.findById(req.user.id);
      res.json({ user });
    } catch (error) {
      logger.error('獲取用戶資料失敗:', error);
      res.status(500).json({ error: '獲取用戶資料失敗' });
    }
  }

  async updateCurrentUser(req: Request, res: Response) {
    try {
      const updatedUser = await this.userService.update(req.user.id, req.body);
      res.json({ message: '更新成功', user: updatedUser });
    } catch (error) {
      logger.error('更新用戶資料失敗:', error);
      res.status(500).json({ error: '更新失敗' });
    }
  }

  async getSubscription(req: Request, res: Response) {
    try {
      const user = await this.userService.findById(req.user.id);
      res.json({
        membershipLevel: user.membershipLevel,
        features: this.getMembershipFeatures(user.membershipLevel)
      });
    } catch (error) {
      res.status(500).json({ error: '獲取會員狀態失敗' });
    }
  }

  async upgradeMembership(req: Request, res: Response) {
    try {
      const { level } = req.body;
      const updatedUser = await this.userService.upgradeMembership(req.user.id, level);
      res.json({ message: '升級成功', user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: '升級失敗' });
    }
  }

  async getPreferences(req: Request, res: Response) {
    try {
      const user = await this.userService.findById(req.user.id);
      res.json({ preferences: user.preferences });
    } catch (error) {
      res.status(500).json({ error: '獲取偏好設置失敗' });
    }
  }

  async updatePreferences(req: Request, res: Response) {
    try {
      const user = await this.userService.findById(req.user.id);
      const updatedUser = await this.userService.update(req.user.id, {
        preferences: { ...user.preferences, ...req.body }
      });
      res.json({ message: '偏好設置更新成功', preferences: updatedUser.preferences });
    } catch (error) {
      res.status(500).json({ error: '更新偏好設置失敗' });
    }
  }

  async deleteAccount(req: Request, res: Response) {
    try {
      await this.userService.delete(req.user.id);
      res.json({ message: '帳戶刪除成功' });
    } catch (error) {
      res.status(500).json({ error: '刪除帳戶失敗' });
    }
  }

  private getMembershipFeatures(level: string) {
    const features = {
      anonymous: ['基礎分析'],
      member: ['基礎分析', '進階分析', '歷史記錄'],
      vip: ['基礎分析', '進階分析', '歷史記錄', '專家級分析', '優先支援']
    };
    return features[level] || features.anonymous;
  }
}