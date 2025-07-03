import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import { uploadImage, getImageById, approveImage, deleteImage } from '../controllers/imageController.js';
import { ACCESS_LEVELS } from '../models/constants/accessLevels.js';

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
router.post('/upload', auth(ACCESS_LEVELS.REGULAR_USER), upload.single('image'), uploadImage);

// Retrieve/get an image by ID
router.get('/:id', auth(ACCESS_LEVELS.TRIAL_USER), getImageById);

// Approve an image (moderator or admin)
router.patch('/:id/approve', auth(ACCESS_LEVELS.MODERATOR), approveImage);

// Delete an image (admin only)
router.delete('/:id', auth(ACCESS_LEVELS.ADMIN), deleteImage);

export default router;
