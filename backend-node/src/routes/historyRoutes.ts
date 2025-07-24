import { Router } from 'express';
import { HistoryController } from '../controllers/historyController';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = Router();
const historyController = new HistoryController();

/**
 * @swagger
 * components:
 *   schemas:
 *     ChartRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [bazi, purple-star, integrated]
 *         metadata:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               nullable: true
 *             birthDate:
 *               type: string
 *               format: date
 *             birthTime:
 *               type: string
 *             location:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     SaveChartRequest:
 *       type: object
 *       required:
 *         - type
 *         - data
 *         - birthDate
 *         - birthTime
 *         - location
 *       properties:
 *         type:
 *           type: string
 *           enum: [bazi, purple-star, integrated]
 *         name:
 *           type: string
 *           nullable: true
 *         data:
 *           type: object
 *           description: 命盤資料
 *         birthDate:
 *           type: string
 *           format: date
 *         birthTime:
 *           type: string
 *         location:
 *           type: string
 *     AnalysisRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         analysisType:
 *           type: string
 *         result:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *     PaginatedCharts:
 *       type: object
 *       properties:
 *         charts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChartRecord'
 *         total:
 *           type: integer
 *         page:
 *           type: integer
 *         totalPages:
 *           type: integer
 */

/**
 * @swagger
 * /api/v1/history/charts:
 *   get:
 *     summary: 獲取命盤歷史記錄
 *     tags: [History]
 *     security:
 *       - BearerAuth: []
 *       - {}
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每頁筆數
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [bazi, purple-star, integrated]
 *         description: 命盤類型過濾
 *     responses:
 *       200:
 *         description: 成功獲取歷史記錄
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedCharts'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/charts', optionalAuth, historyController.getChartHistory);

/**
 * @swagger
 * /api/v1/history/charts:
 *   post:
 *     summary: 保存命盤記錄
 *     tags: [History]
 *     security:
 *       - BearerAuth: []
 *       - {}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaveChartRequest'
 *     responses:
 *       201:
 *         description: 保存成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 chart:
 *                   $ref: '#/components/schemas/ChartRecord'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/charts', optionalAuth, historyController.saveChart);

/**
 * @swagger
 * /api/v1/history/charts/{id}:
 *   get:
 *     summary: 獲取特定命盤記錄
 *     tags: [History]
 *     security:
 *       - BearerAuth: []
 *       - {}
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 命盤記錄 ID
 *     responses:
 *       200:
 *         description: 成功獲取命盤記錄
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chart:
 *                   $ref: '#/components/schemas/ChartRecord'
 *       404:
 *         description: 命盤記錄不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/charts/:id', optionalAuth, historyController.getChart);

/**
 * @swagger
 * /api/v1/history/charts/{id}:
 *   delete:
 *     summary: 刪除命盤記錄
 *     tags: [History]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 命盤記錄 ID
 *     responses:
 *       200:
 *         description: 刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 記錄不存在或無權限刪除
 */
router.delete('/charts/:id', authMiddleware, historyController.deleteChart);

/**
 * @swagger
 * /api/v1/history/analyses:
 *   get:
 *     summary: 獲取分析歷史
 *     tags: [History]
 *     security:
 *       - BearerAuth: []
 *       - {}
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: 成功獲取分析歷史
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analyses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AnalysisRecord'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */
router.get('/analyses', optionalAuth, historyController.getAnalysisHistory);

// 保存分析記錄
router.post('/analyses', optionalAuth, historyController.saveAnalysis);

/**
 * @swagger
 * /api/v1/history/export:
 *   get:
 *     summary: 匯出歷史記錄
 *     tags: [History]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: 匯出格式
 *     responses:
 *       200:
 *         description: 匯出成功
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/export', authMiddleware, historyController.exportHistory);

/**
 * @swagger
 * /api/v1/history/batch:
 *   delete:
 *     summary: 批量刪除記錄
 *     tags: [History]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: 要刪除的記錄 ID 列表
 *     responses:
 *       200:
 *         description: 批量刪除成功
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
router.delete('/batch', authMiddleware, historyController.batchDelete);

export default router;