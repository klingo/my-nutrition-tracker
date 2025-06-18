import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

export default mongoose.model('Log', LogSchema);
