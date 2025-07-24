import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware, requireMembership } from '../middleware/auth';
import { userDataCacheMiddleware } from '../middleware/cache';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserPreferences:
 *       type: object
 *       properties:
 *         language:
 *           type: string
 *           enum: [zh_TW, zh, en]
 *           default: zh_TW
 *         displayMode:
 *           type: string
 *           enum: [compact, detailed, expert]
 *           default: detailed
 *         notifications:
 *           type: boolean
 *           default: true
 *         theme:
 *           type: string
 *           enum: [light, dark]
 *           default: light
 *     Subscription:
 *       type: object
 *       properties:
 *         membershipLevel:
 *           type: string
 *           enum: [anonymous, member, vip]
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: 可用功能列表
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     UpgradeRequest:
 *       type: object
 *       required:
 *         - level
 *       properties:
 *         level:
 *           type: string
 *           enum: [member, vip]
 */

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: 獲取當前用戶資訊
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取用戶資訊
 *         headers:
 *           X-Cache:
 *             description: 快取狀態
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', authMiddleware, userDataCacheMiddleware, userController.getCurrentUser);

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     summary: 更新個人資料
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               timezone:
 *                 type: string
 *                 example: Asia/Taipei
 *               preferences:
 *                 $ref: '#/components/schemas/UserPreferences'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/me', authMiddleware, userController.updateCurrentUser);

/**
 * @swagger
 * /api/v1/users/subscription:
 *   get:
 *     summary: 獲取會員狀態
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取會員狀態
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/subscription', authMiddleware, userDataCacheMiddleware, userController.getSubscription);

/**
 * @swagger
 * /api/v1/users/upgrade:
 *   post:
 *     summary: 會員升級
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpgradeRequest'
 *     responses:
 *       200:
 *         description: 升級成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/upgrade', authMiddleware, userController.upgradeMembership);

/**
 * @swagger
 * /api/v1/users/preferences:
 *   get:
 *     summary: 獲取用戶偏好設置
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取偏好設置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preferences:
 *                   $ref: '#/components/schemas/UserPreferences'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/preferences', authMiddleware, userDataCacheMiddleware, userController.getPreferences);

/**
 * @swagger
 * /api/v1/users/preferences:
 *   put:
 *     summary: 更新用戶偏好設置
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserPreferences'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 preferences:
 *                   $ref: '#/components/schemas/UserPreferences'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/preferences', authMiddleware, userController.updatePreferences);

/**
 * @swagger
 * /api/v1/users/me:
 *   delete:
 *     summary: 刪除帳戶
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 帳戶刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/me', authMiddleware, userController.deleteAccount);

export default router;