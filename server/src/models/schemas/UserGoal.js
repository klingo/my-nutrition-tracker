import mongoose from 'mongoose';

const UserGoalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        type: {
            type: String,
            enum: ['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain'],
            required: true,
        },
        targets: {
            calories: {
                min: { type: Number, min: 0 },
                max: { type: Number, min: 0 },
            },
            macros: {
                protein: { min: { type: Number, min: 0 }, max: { type: Number, min: 0 } },
                carbs: { min: { type: Number, min: 0 }, max: { type: Number, min: 0 } },
                fat: { min: { type: Number, min: 0 }, max: { type: Number, min: 0 } },
            },
        },
    },
    { timestamps: true },
);

export default mongoose.model('UserGoal', UserGoalSchema);
