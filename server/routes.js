import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Product, Log } from './models/index.js';
import auth from './middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.send('User registered');
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).send('Server error');
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Server error');
    }
});

router.post('/product', auth, async (req, res) => {
    try {
        const { name, fat, protein, fiber, carbs } = req.body;
        const product = new Product({ name, fat, protein, fiber, carbs });
        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).send('Server error');
    }
});

router.get('/products', auth, async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/log', auth, async (req, res) => {
    try {
        const { productId, amount } = req.body;
        const log = new Log({ userId: req.user.id, productId, amount });
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
        const logs = await Log.find({
            userId: req.user.id,
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

export default router;
