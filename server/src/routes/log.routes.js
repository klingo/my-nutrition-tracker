import express from 'express';
import { IntakeLog } from '../models/index.js';
import auth from '../middleware/auth.js';
import { ACCESS_LEVELS } from '../models/constants/accessLevels.js';

const router = express.Router();

// Log food intake (any authenticated user)
router.post('/', auth(), async (req, res) => {
    try {
        const { productId, amount } = req.body;
        const log = new IntakeLog({ userId: req.user.userId, productId, amount });
        await log.save();
        res.json(log);
    } catch (error) {
        console.error('Log consumption error:', error);
        res.status(500).send('Server error');
    }
});

// Get daily totals for the current user (any authenticated user)
router.get('/daily-totals', auth(), async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const logs = await IntakeLog.find({
            userId: req.user.userId,
            date: { $gte: startOfDay },
        }).populate('productId');
        const totals = logs.reduce(
            (acc, log) => {
                acc.fat += (log.productId.fat || 0) * log.amount;
                acc.protein += (log.productId.protein || 0) * log.amount;
                acc.fiber += (log.productId.fiber || 0) * log.amount;
                acc.carbs += (log.productId.carbs || 0) * log.amount;
                return acc;
            },
            { fat: 0, protein: 0, fiber: 0, carbs: 0 },
        );
        totals.netCarbs = totals.carbs - totals.fiber;
        res.json(totals);
    } catch (error) {
        console.error('Get totals error:', error);
        res.status(500).send('Server error');
    }
});

// Get all logs (admin only)
router.get('/', auth(ACCESS_LEVELS.ADMIN), async (req, res) => {
    try {
        const logs = await IntakeLog.find().populate('productId userId');
        res.json(logs);
    } catch (error) {
        console.error('Get all logs error:', error);
        res.status(500).send('Server error');
    }
});

// Get logs for a specific user (admin or moderator)
router.get('/user/:userId', auth(ACCESS_LEVELS.MODERATOR), async (req, res) => {
    try {
        const logs = await IntakeLog.find({ userId: req.params.userId }).populate('productId');
        res.json(logs);
    } catch (error) {
        console.error('Get user logs error:', error);
        res.status(500).send('Server error');
    }
});

export default router;
