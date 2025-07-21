import fs from 'fs';
import path from 'path';
import Image from '../models/schemas/Image.js';

// Upload an image
export const uploadImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
        // Read the file data
        const uploadsDir = path.resolve(__dirname, '..', 'uploads');
        const filePath = path.resolve(uploadsDir, req.file.filename);
        // Ensure the filePath is within uploadsDir
        if (!filePath.startsWith(uploadsDir + path.sep)) {
            return res.status(400).json({ message: 'Invalid file path.' });
        }
        const imageData = fs.readFileSync(filePath);

        // Create a new Image document
        const image = new Image({
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            data: imageData,
            uploaderId: req.user._id,
        });

        // Save the image to MongoDB
        await image.save();

        // Remove the temporary file from disk
        fs.unlinkSync(filePath);

        res.status(201).json({
            _embedded: {
                image: {
                    id: image._id,
                    filename: image.filename,
                    contentType: image.contentType,
                    uploaderId: image.uploaderId,
                },
            },
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Retrieve/get an image by ID
export const getImageById = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found.' });
        }
        // TODO: only return image if it is approved; depending on user access level
        res.set('Content-Type', image.contentType);
        res.send(image.data);
    } catch (error) {
        console.error('Error retrieving image:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Approve an image
export const approveImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found.' });
        }

        // Update the approval status and record the verifier's ID and timestamp
        image.status.isVerified = true;
        image.status.verifierId = req.user._id;
        image.status.verifiedAt = new Date();

        await image.save();

        res.status(200).json({
            _embedded: {
                image: {
                    id: image._id,
                    isVerified: image.status.isVerified,
                    verifiedAt: image.status.verifiedAt,
                },
            },
        });
    } catch (error) {
        console.error('Error approving image:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Delete an image
export const deleteImage = async (req, res) => {
    try {
        const image = await Image.findByIdAndDelete(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found.' });
        }
        res.json({ message: 'Image deleted successfully.' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};
