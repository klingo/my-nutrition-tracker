import mongoose from 'mongoose';

const BrandSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        logo: {
            type: String,
            validate: {
                validator: (v) => !v || /^https?:\/\/.+/.test(v),
                message: 'Logo must be a valid URL',
            },
        },
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true },
);

export default mongoose.model('Brand', BrandSchema);
