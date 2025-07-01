import mongoose from 'mongoose';
import { UNITS } from '../constants/units.js';
import { MEAL_TYPE } from '../constants/enums.js';
import { convertWeight } from '../../utils/weightConversions.js';

const IntakeLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        customMealId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CustomMeal',
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        mealType: {
            type: String,
            enum: Object.values(MEAL_TYPE),
            required: true,
        },
        amount: {
            value: { type: Number, required: true, min: 0 },
            unit: { type: String, enum: [...UNITS.PRODUCT_WEIGHT, ...UNITS.VOLUME], required: true },
        },
        notes: { type: String, trim: true },
    },
    { timestamps: true },
);

// Validate that either productId or customMealId is provided, but not both
IntakeLogSchema.pre('validate', function (next) {
    if ((this.productId && this.customMealId) || (!this.productId && !this.customMealId)) {
        next(new Error('Either productId or customMealId must be provided, but not both'));
    } else {
        next();
    }
});

IntakeLogSchema.pre('save', async function (next) {
    this.amountConsumed = {
        value: convertWeight.toGrams(this.amount.value, this.amount.unit),
        unit: 'g',
    };
    next();
});

export default mongoose.model('IntakeLog', IntakeLogSchema);
