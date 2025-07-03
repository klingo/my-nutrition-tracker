import express from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import logRoutes from './log.routes.js';
import userRoutes from './user.routes.js';
import imageRoutes from './image.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/logs', logRoutes);
router.use('/users', userRoutes);
router.use('/images', imageRoutes);

export default router;
