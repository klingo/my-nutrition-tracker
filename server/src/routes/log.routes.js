import express from 'express';
import auth from '../middleware/auth.js';
import { ACCESS_LEVELS } from '../models/constants/accessLevels.js';
import { mutationLimiter, queryLimiter } from '../middleware/rateLimiters.js';
import { getDailyTotals, getUserIntakeLogs, logProductIntake } from '../controllers/logController.js';

const router = express.Router();

// Log product intake
router.post('/', mutationLimiter, auth(ACCESS_LEVELS.TRIAL_USER), logProductIntake);

// Get daily totals for the current user
router.get('/daily-totals', queryLimiter, auth(ACCESS_LEVELS.TRIAL_USER), getDailyTotals);

// Get intake logs for a specific user
router.get('/user/:userId', queryLimiter, auth(ACCESS_LEVELS.MODERATOR), getUserIntakeLogs);

export default router;
