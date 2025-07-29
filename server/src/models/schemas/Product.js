import mongoose from 'mongoose';
import { UNITS, WEIGHT_UNITS } from '../constants/units.js';

const nutrientValuesSchema = {
    energy: {
        kcal: { type: Number, required: true, min: 0 },
    },
    carbohydrates: {
        total: { type: Number, required: true, min: 0 },
        sugars: { type: Number, min: 0 },
        polyols: {
            total: { type: Number, min: 0 },
            erythritol: { type: Number, min: 0 }, // 100% subtracted from carbs
            //mannitol: { type: Number, min: 0 }, // 100% subtracted from carbs
            //isomalt: { type: Number, min: 0 }, // 70% subtracted from carbs
            sorbitol: { type: Number, min: 0 }, // 50-75% subtracted from carbs
            xylitol: { type: Number, min: 0 }, // 50-65% subtracted from carbs
            maltitol: { type: Number, min: 0 }, // 50% subtracted from carbs
            //glycerol: { type: Number, min: 0 }, // 50% subtracted from carbs
        },
        starches: { type: Number, min: 0 },
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
        b1: { type: Number, min: 0 }, // in mg
        b2: { type: Number, min: 0 }, // in mg
        b3: { type: Number, min: 0 }, // in mg
        b6: { type: Number, min: 0 }, // in mg
        b12: { type: Number, min: 0 }, // in mcg
        c: { type: Number, min: 0 }, // in mg
        d: { type: Number, min: 0 }, // in IU
        e: { type: Number, min: 0 }, // in IU
        k: { type: Number, min: 0 }, // in mcg
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
        nutrientLevels: {
            fat: {
                type: String,
                enum: ['low', 'medium', 'high'],
            },
            saturatedFat: {
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

// Helper function to deeply multiply all number values by a ratio
const multiplyNestedValues = (obj, ratio) => {
    if (obj === null || typeof obj !== 'object') return obj;

    // Handle arrays
    if (Array.isArray(obj)) return obj.map((item) => multiplyNestedValues(item, ratio));

    // Handle objects
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== null && typeof value === 'object') {
            // Recursively handle nested objects
            result[key] = multiplyNestedValues(value, ratio);
        } else if (typeof value === 'number') {
            // Multiply only number values
            result[key] = value * ratio;
        } else {
            // Keep other values as is
            result[key] = value;
        }
    }
    return result;
};

ProductSchema.virtual('packageNutrients').get(function () {
    const ratio = this.package.amount / this.nutrients.referenceAmount.amount;
    return multiplyNestedValues(this.nutrients.values, ratio);
});

ProductSchema.virtual('nutrients.values.carbohydrates.netCarbs').get(function () {
    const { total = 0, fiber = 0, polyols = {} } = this.nutrients.values.carbohydrates;
    return Math.max(0, total - fiber - (polyols.total || 0) * 0.5);
});

// Ensure virtuals are included in toJSON output
ProductSchema.set('toJSON', {
    virtuals: true,
    versionKey: false, // Remove __v
    transform: (doc, ret) => {
        // Ensure _id is a string
        ret._id = ret._id.toString();
        // Remove any id field to prevent duplicates
        delete ret.id;
        return ret;
    },
});

export default mongoose.model('Product', ProductSchema);
