import express from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import logRoutes from './log.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/logs', logRoutes);

export default router;
