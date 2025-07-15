import mongoose from 'mongoose';
import { UNITS } from '../constants/units.js';

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
            required: true,
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
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        barcode: {
            type: String,
            unique: true,
            sparse: true,
        },
        packageSize: {
            value: { type: Number, min: 0 },
            unit: { type: String, enum: UNITS.PACKAGE_SIZE },
        },
        servingSize: {
            value: { type: Number, min: 0 },
            unit: { type: String, enum: UNITS.PACKAGE_SIZE },
        },
        image: {
            type: String,
            validate: {
                validator: (v) => !v || /^https?:\/\/.+/.test(v),
                message: 'Image must be a valid URL',
            },
        },
        nutrients: {
            per100g: {
                kcal: { type: Number, required: true, min: 0 },
                carbs: {
                    total: { type: Number, required: true, min: 0 },
                    sugars: { type: Number, required: true, min: 0 },
                    polyols: { type: Number, min: 0 },
                },
                fat: {
                    total: { type: Number, required: true, min: 0 },
                    saturated: { type: Number, required: true, min: 0 },
                    monounsaturated: { type: Number, min: 0 },
                    polyunsaturated: { type: Number, min: 0 },
                },
                protein: { type: Number, required: true, min: 0 },
                fiber: { type: Number, required: true, min: 0 },
                salt: { type: Number, required: true, min: 0 },
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
                minerals: {
                    magnesium: { type: Number, min: 0 }, // in mg
                    potassium: { type: Number, min: 0 }, // in mg
                    sodium: { type: Number, min: 0 }, // in mg
                    calcium: { type: Number, min: 0 }, // in mg
                    iron: { type: Number, min: 0 }, // in mg
                    zinc: { type: Number, min: 0 }, // in mg
                },
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

export default mongoose.model('Product', ProductSchema);
