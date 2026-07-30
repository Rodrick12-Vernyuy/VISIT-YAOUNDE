import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rateLimiter';
import { loginSchema, refreshSchema, registerSchema, updateProfileSchema } from '../validators/auth.validator';

export const authRouter = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: User created
 */
authRouter.post('/register', authRateLimiter, validate(registerSchema), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email and password
 *     responses:
 *       200:
 *         description: Authenticated
 */
authRouter.post('/login', authRateLimiter, validate(loginSchema), authController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a refresh token for a new access token
 *     responses:
 *       200:
 *         description: New tokens issued
 */
authRouter.post('/refresh', validate(refreshSchema), authController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke the current refresh token
 *     responses:
 *       204:
 *         description: Logged out
 */
authRouter.post('/logout', authController.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 */
authRouter.get('/me', authenticate, authController.me);

/**
 * @openapi
 * /auth/me:
 *   patch:
 *     tags: [Auth]
 *     summary: Update the current user's profile (display name)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Updated user
 */
authRouter.patch('/me', authenticate, validate(updateProfileSchema), authController.updateProfile);
