import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema(
    {
        filename: {
            type: String,
            required: true,
            trim: true,
        },
        contentType: {
            type: String,
            required: true,
        },
        data: {
            type: Buffer,
            required: true,
            validate: {
                validator: (data) => data.length > 1024 * 1024, // 1MB limit
                message: 'Image size exceeds the maximum allowed limit of 1MB',
            },
        },
        uploaderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            isVerified: {
                type: Boolean,
                default: false,
            },
            verifierId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null,
            },
            verifiedAt: {
                type: Date,
                default: null,
            },
        },
    },
    { timestamps: true },
);

export default mongoose.model('Image', ImageSchema);
