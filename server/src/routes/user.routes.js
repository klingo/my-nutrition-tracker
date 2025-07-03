import express from 'express';
import auth from '../middleware/auth.js';
import {
    deleteUserById,
    getActiveUserCount,
    getAllUsers,
    getUserById,
    updateCalculations,
    updateUserById,
} from '../controllers/userController.js';
import { ACCESS_LEVELS } from '../models/constants/accessLevels.js';

const router = express.Router();

// Get user details (excluding password) with energy calculations
router.get('/me', auth(), getUserById);

// Update user details (with restrictions)
router.patch('/me', auth(ACCESS_LEVELS.TRIAL_USER), updateUserById);

// Get total number of non-blocked users
router.get('/count', auth(ACCESS_LEVELS.MODERATOR), getActiveUserCount);

// Update calculations
router.post('/update-calculations', auth(ACCESS_LEVELS.REGULAR_USER), updateCalculations);

// Get all users (admin only)
router.get('/', auth(ACCESS_LEVELS.ADMIN), getAllUsers);

// Get user by ID (admin or moderator)
router.get('/:id', auth(ACCESS_LEVELS.MODERATOR), getUserById);

// Update user (admin only)
router.patch('/:id', auth(ACCESS_LEVELS.ADMIN), updateUserById);

// Delete user (admin only)
router.delete('/:id', auth(ACCESS_LEVELS.ADMIN), deleteUserById);

export default router;
