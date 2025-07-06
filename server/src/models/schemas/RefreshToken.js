import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        isRevoked: {
            type: Boolean,
            default: false,
        },
        revokedAt: {
            type: Date,
            default: null,
        },
        replacedByToken: {
            type: String,
            default: null,
        },
    },
    { timestamps: true },
);

// Add index for faster queries
RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ token: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance method to check if token is active
RefreshTokenSchema.methods.isActive = function () {
    return !this.isRevoked && this.expiresAt > new Date();
};

// Static method to revoke a token
RefreshTokenSchema.statics.revokeToken = async function (token, replacedByToken = null) {
    const updatedToken = await this.findOneAndUpdate(
        { token },
        {
            isRevoked: true,
            revokedAt: new Date(),
            replacedByToken,
        },
        { new: true },
    );
    return updatedToken;
};

export default mongoose.model('RefreshToken', RefreshTokenSchema);
