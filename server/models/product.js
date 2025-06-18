import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fat: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
});

export default mongoose.model('Product', ProductSchema);
