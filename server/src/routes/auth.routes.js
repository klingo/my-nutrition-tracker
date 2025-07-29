import express from 'express';
import auth from '../middleware/auth.js';
import { authLimiter, mutationLimiter, refreshLimiter, statusLimiter } from '../middleware/rateLimiters.js';
import {
    checkAuthStatus,
    loginUser,
    logoutUser,
    logoutUserEverywhere,
    refreshUserTokens,
    registerUser,
} from '../controllers/authController.js';
import { ACCESS_LEVELS } from '../models/constants/accessLevels.js';

const router = express.Router();

// Register a new user
router.post('/register', authLimiter, registerUser);

// Login a user
router.post('/login', authLimiter, loginUser);

// Refresh tokens
router.post('/refresh', refreshLimiter, auth(ACCESS_LEVELS.TRIAL_USER_1), refreshUserTokens);

// Logs the user out by revoking their refresh token and clearing their authentication cookies.
router.post('/logout', mutationLimiter, auth(ACCESS_LEVELS.TRIAL_USER_1), logoutUser);

// Logs the user out from all devices by revoking their refresh token and clearing their authentication cookies.
router.post('/logout-everywhere', mutationLimiter, auth(ACCESS_LEVELS.TRIAL_USER_1), logoutUserEverywhere);

// Check the authentication status, refresh access token and fetch minimal user data
router.get('/status', statusLimiter, auth(), checkAuthStatus);

export default router;
