import express from 'express';
import { IntakeLog } from '../models/index.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
    try {
        const { productId, amount } = req.body;
        const log = new IntakeLog({ userId: req.user.id, productId, amount });
        await log.save();
        res.json(log);
    } catch (error) {
        console.error('Log consumption error:', error);
        res.status(500).send('Server error');
    }
});

router.get('/daily-totals', auth, async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const logs = await IntakeLog.find({
            userId: req.user.id,
            date: { $gte: startOfDay },
        }).populate('productId');
        const totals = logs.reduce((acc, log) => {
            acc.fat += (log.productId.fat || 0) * log.amount;
            acc.protein += (log.productId.protein || 0) * log.amount;
            acc.fiber += (log.productId.fiber || 0) * log.amount;
            acc.carbs += (log.productId.carbs || 0) * log.amount;
            return acc;
        }, { fat: 0, protein: 0, fiber: 0, carbs: 0 });
        totals.netCarbs = totals.carbs - totals.fiber;
        res.json(totals);
    } catch (error) {
        console.error('Get totals error:', error);
        res.status(500).send('Server error');
    }
});

export default router;
