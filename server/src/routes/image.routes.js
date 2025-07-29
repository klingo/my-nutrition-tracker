import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import { uploadImage, getImageById, approveImage, deleteImage } from '../controllers/imageController.js';
import { ACCESS_LEVELS } from '../models/constants/accessLevels.js';
import { mutationLimiter, queryLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 }, // 1MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
});

// Upload an image
router.post('/upload', mutationLimiter, auth(ACCESS_LEVELS.REGULAR_USER_3), upload.single('image'), uploadImage);

// Retrieve/get an image by ID
router.get('/:id', queryLimiter, auth(ACCESS_LEVELS.TRIAL_USER_1), getImageById);

// Approve an image (moderator or admin)
router.patch('/:id/approve', mutationLimiter, auth(ACCESS_LEVELS.MODERATOR_5), approveImage);

// Delete an image (admin only)
router.delete('/:id', mutationLimiter, auth(ACCESS_LEVELS.ADMIN_6), deleteImage);

export default router;
