import express from 'express';
import { Product } from '../models/index.js';
import auth from '../middleware/auth.js';
import { ACCESS_LEVELS } from '../models/constants/accessLevels.js';
import { mutationLimiter, queryLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

// Create a new product (requires moderator access)
router.post('/', mutationLimiter, auth(ACCESS_LEVELS.MODERATOR), async (req, res) => {
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

// Get all products (any authenticated user)
router.get('/', queryLimiter, auth(), async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).send('Server error');
    }
});

export default router;
