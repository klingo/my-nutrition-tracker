import express from 'express';
import auth from '../middleware/auth.js';
import { ACCESS_LEVELS } from '../models/constants/accessLevels.js';
import { mutationLimiter, queryLimiter } from '../middleware/rateLimiters.js';
import { createProduct, getAllProducts, getProductById, updateProduct } from '../controllers/productController.js';

const router = express.Router();

// Get all products (authenticated only)
router.get('/', queryLimiter, auth(ACCESS_LEVELS.TRIAL_USER_1), getAllProducts);

// Get a specific product (authenticated only)
router.get('/:id', queryLimiter, auth(ACCESS_LEVELS.TRIAL_USER_1), getProductById);

// Create a new product (requires moderator access)
router.post('/', mutationLimiter, auth(ACCESS_LEVELS.MODERATOR_5), createProduct);

// Update a product (requires moderator access)
router.patch('/:id', mutationLimiter, auth(ACCESS_LEVELS.MODERATOR_5), updateProduct);

export default router;
