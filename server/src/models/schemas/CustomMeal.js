import mongoose from 'mongoose';
import { UNITS } from '../constants/units.js';

const MealItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        amount: {
            value: { type: Number, required: true, min: 0 },
            unit: { type: String, enum: [...UNITS.PRODUCT_WEIGHT, ...UNITS.VOLUME], required: true },
        },
    },
    { _id: false },
);

const CustomMealSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
        },
        items: [MealItemSchema],
        totalServings: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
        image: {
            type: String,
            validate: {
                validator: (v) => !v || /^https?:\/\/.+/.test(v),
                message: 'Image must be a valid URL',
            },
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    { timestamps: true },
);

// Virtual for calculating total nutrients
CustomMealSchema.virtual('nutrients').get(function () {
    // This would be implemented to calculate total nutrients based on items
    // Implementation would depend on how product nutrients are structured
    return {};
});

export default mongoose.model('CustomMeal', CustomMealSchema);
