/**
 * Daily Reminder Routes
 *
 * Provides GET /api/v1/daily-reminder endpoint for daily reminder functionality.
 * Uses itty-router AutoRouter pattern.
 */

import type { Router } from 'itty-router';
import { DailyReminderController } from '../controllers/dailyReminderController';
import type { Env } from '../index';

/**
 * Create daily reminder routes
 *
 * @param router - itty-router AutoRouter instance
 * @param env - Cloudflare Worker environment (not used in route definition, passed at runtime)
 *
 * @example
 * const router = AutoRouter();
 * createDailyReminderRoutes(router, env);
 */
export function createDailyReminderRoutes(router: Router, env?: Env) {
  /**
   * GET /api/v1/daily-reminder
   *
   * Query Parameters:
   * - chartId: string (required) - Chart UUID
   * - date: string (required) - ISO 8601 date string (e.g., 2025-12-06T00:00:00.000Z)
   *
   * Response:
   * {
   *   "text": "今日宜靜不宜動,保持平常心即可 🍃",
   *   "tags": [
   *     { "label": "宜靜", "type": "warning" },
   *     { "label": "謹慎", "type": "warning" }
   *   ]
   * }
   *
   * Error Responses:
   * - 400: Missing or invalid parameters
   * - 404: Chart not found
   * - 500: Internal server error
   */
  router.get('/api/v1/daily-reminder', async (req: any, routeEnv: any) => {
    try {
      // Use passed env or fallback to route env
      const actualEnv = env || routeEnv;

      if (!actualEnv || !actualEnv.DB) {
        console.error('[dailyReminderRoutes] DB not available in env');
        return Response.json(
          { error: 'Database not available' },
          { status: 500 }
        );
      }

      // Parse query parameters
      const url = new URL(req.url);
      const chartId = url.searchParams.get('chartId');
      const dateParam = url.searchParams.get('date');

      // Validate required parameters
      if (!chartId) {
        return Response.json(
          { error: 'Missing required parameter: chartId' },
          { status: 400 }
        );
      }

      if (!dateParam) {
        return Response.json(
          { error: 'Missing required parameter: date' },
          { status: 400 }
        );
      }

      // Call controller
      const controller = new DailyReminderController();
      const reminder = await controller.getDailyReminder(
        actualEnv.DB,
        chartId,
        dateParam
      );

      // Return successful response
      return Response.json(reminder, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
        }
      });
    } catch (error) {
      console.error('[dailyReminderRoutes] Error:', error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message === 'Chart not found') {
          return Response.json(
            { error: 'Chart not found' },
            { status: 404 }
          );
        }

        if (error.message === 'Invalid date format') {
          return Response.json(
            { error: 'Invalid date format. Expected ISO 8601 string.' },
            { status: 400 }
          );
        }
      }

      // Generic error response
      return Response.json(
        {
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  });
}
