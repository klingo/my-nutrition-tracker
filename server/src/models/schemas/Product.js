import mongoose from 'mongoose';
import { UNITS, WEIGHT_UNITS } from '../constants/units.js';

const nutrientValuesSchema = {
    kcal: { type: Number, required: true, min: 0 },
    carbs: {
        total: { type: Number, required: true, min: 0 },
        sugars: { type: Number, min: 0 },
        polyols: { type: Number, min: 0 },
        fiber: { type: Number, min: 0 },
    },
    lipids: {
        total: { type: Number, required: true, min: 0 },
        saturated: { type: Number, min: 0 },
        monounsaturated: { type: Number, min: 0 },
        polyunsaturated: { type: Number, min: 0 },
    },
    protein: { type: Number, required: true, min: 0 },
    minerals: {
        salt: { type: Number, min: 0 }, // in g
        magnesium: { type: Number, min: 0 }, // in mg
        potassium: { type: Number, min: 0 }, // in mg
        sodium: { type: Number, min: 0 }, // in mg
        calcium: { type: Number, min: 0 }, // in mg
        iron: { type: Number, min: 0 }, // in mg
        zinc: { type: Number, min: 0 }, // in mg
    },
    vitamins: {
        a: { type: Number, min: 0 }, // in IU
        c: { type: Number, min: 0 }, // in mg
        d: { type: Number, min: 0 }, // in IU
        e: { type: Number, min: 0 }, // in IU
        k: { type: Number, min: 0 }, // in mcg
        b1: { type: Number, min: 0 }, // in mg
        b2: { type: Number, min: 0 }, // in mg
        b3: { type: Number, min: 0 }, // in mg
        b6: { type: Number, min: 0 }, // in mg
        b12: { type: Number, min: 0 }, // in mcg
    },
};

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Brand',
            // required: true,
        },
        category: {
            type: String,
            required: true,
            enum: [
                'fruits',
                'vegetables',
                'grains',
                'protein',
                'dairy',
                'fats',
                'beverages',
                'snacks',
                'prepared_meals',
                'other',
            ],
            index: true,
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        barcode: {
            type: String,
            unique: true,
            sparse: true,
        },
        images: [
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
        ],
        // Package information
        package: {
            amount: { type: Number, min: 0 },
            unit: { type: String, enum: UNITS.PACKAGE_SIZE },
        },
        // Standardized nutrient values (e.g. per 100g)
        nutrients: {
            referenceAmount: {
                amount: { type: Number, default: 100, min: 0 },
                unit: { type: String, default: WEIGHT_UNITS.GRAM, enum: UNITS.PACKAGE_SIZE },
            },
            values: nutrientValuesSchema,
        },
        // Nutrient level ratings
        nutrient_levels: {
            fat: {
                type: String,
                enum: ['low', 'medium', 'high'],
            },
            saturated_fat: {
                type: String,
                enum: ['low', 'medium', 'high'],
            },
            sugars: {
                type: String,
                enum: ['low', 'medium', 'high'],
            },
            salt: {
                type: String,
                enum: ['low', 'medium', 'high'],
            },
        },
        allergens: [
            {
                type: String,
                enum: ['milk', 'eggs', 'fish', 'shellfish', 'tree_nuts', 'peanuts', 'wheat', 'soy'],
            },
        ],
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true },
);

ProductSchema.virtual('packageNutrients').get(function () {
    const ratio = this.package.amount / this.nutrients.referenceAmount.amount;
    const result = {};

    // Deep clone and multiply values by ratio
    Object.keys(this.nutrients.values).forEach((key) => {
        if (typeof this.nutrients.values[key] === 'object') {
            result[key] = {};
            Object.keys(this.nutrients.values[key]).forEach((subKey) => {
                result[key][subKey] = this.nutrients.values[key][subKey] * ratio;
            });
        } else {
            result[key] = this.nutrients.values[key] * ratio;
        }
    });

    return result;
});

// Ensure virtuals are included in toJSON output
ProductSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Product', ProductSchema);
