import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export interface UserPreferences {
  language: string;
  displayMode: string;
  notifications: boolean;
  theme: 'light' | 'dark';
}

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async create(userData: Partial<User>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password!, 10);
    
    const user = this.userRepository.create({
      email: userData.email!,
      password: hashedPassword,
      name: userData.name!,
      timezone: userData.timezone || 'Asia/Taipei',
      membershipLevel: userData.membershipLevel || 'anonymous',
      preferences: {
        language: 'zh_TW',
        displayMode: 'detailed',
        notifications: true,
        theme: 'light'
      }
    });

    const savedUser = await this.userRepository.save(user);
    logger.info(`用戶創建成功: ${savedUser.email}`);
    
    return savedUser;
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected > 0;
  }

  async upgradeMembership(id: string, level: 'member' | 'vip'): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    await this.userRepository.update(id, { membershipLevel: level });
    logger.info(`用戶 ${user.email} 升級為 ${level}`);
    
    return await this.findById(id);
  }
}