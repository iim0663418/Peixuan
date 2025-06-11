import { Router, Request, Response, RequestHandler } from 'express';
import { generateToken } from '../middleware/auth';
import { tokenRefreshHandler } from '../middleware/tokenRefresh';
import { getFeatureAccessByRole, isAnonymousAllowed, getAnonymousFeatures } from '../middleware/featureAccess';

const router = Router();

/**
 * User login endpoint.
 * This is a simplified implementation. In a production environment, validate user credentials.
 */
const loginHandler: RequestHandler = (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role) {
    res.status(400).json({ error: 'Missing userId or role' });
    return;
  }
  // Assign feature access based on role (example: admin gets full access, others get limited access)
  const features = role === 'admin' ? ['all'] : ['read'];
  // Generate an access token with a 1-hour expiration.
  const accessToken = generateToken({ userId, role, features }, '1h');
  // Generate a refresh token with a 7-day expiration.
  const refreshToken = generateToken({ userId, role, features }, '7d');
  res.json({ accessToken, refreshToken });
  return;
};

router.post('/login', loginHandler);

/**
 * Token refresh endpoint.
 * It uses the tokenRefreshHandler middleware to refresh the access token.
 */
router.post('/refresh', tokenRefreshHandler);

export default router;
