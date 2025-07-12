import { IntakeLog } from '../models/index.js';

export const logProductIntake = async (req, res) => {
    try {
        const { productId, amount } = req.body;
        const log = new IntakeLog({ userId: req.user.userId, productId, amount });
        await log.save();
        res.json(log);
    } catch (error) {
        console.error('Log consumption error:', error);
        res.status(500).send('Server error');
    }
};

export const getUserIntakeLogs = async (req, res) => {
    try {
        const logs = await IntakeLog.find({ userId: req.params.userId }).populate('productId');
        res.json(logs);
    } catch (error) {
        console.error('Get user logs error:', error);
        res.status(500).send('Server error');
    }
};

export const getDailyTotals = async (req, res) => {
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
};
