import mongoose from 'mongoose';
import crypto from 'crypto';

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
        familyId: {
            type: String,
            required: true,
            index: true,
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
RefreshTokenSchema.index({ userId: 1, familyId: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Generate a new token family ID
RefreshTokenSchema.statics.generateFamilyId = function () {
    return crypto.randomBytes(16).toString('hex');
};

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

// Revoke all tokens in a family (e.g., when suspicious activity is detected)
RefreshTokenSchema.statics.revokeFamily = async function (userId, familyId) {
    await this.updateMany(
        { userId, familyId, isRevoked: false },
        {
            isRevoked: true,
            revokedAt: new Date(),
            $set: { replacedByToken: 'FAMILY_REVOKED' },
        },
    );
};

RefreshTokenSchema.statics.revokeAllForUser = async function (userId) {
    return this.updateMany(
        { userId, isRevoked: false },
        {
            isRevoked: true,
            revokedAt: new Date(),
            $set: { replacedByToken: 'LOGGED_OUT_EVERYWHERE' },
        },
    );
};

// Check for token reuse (possible attack)
RefreshTokenSchema.statics.detectSuspiciousActivity = async function (userId, familyId) {
    // Count active tokens in this family
    const activeTokens = await this.countDocuments({
        userId,
        familyId,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
    });

    // If more than 2 active tokens in the same family, it might be suspicious
    return activeTokens > 2;
};

export default mongoose.model('RefreshToken', RefreshTokenSchema);
