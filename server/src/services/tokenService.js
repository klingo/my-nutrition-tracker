import jwt from 'jsonwebtoken';
import { User, RefreshToken } from '../models/index.js';
import config from '../config/app.config.js';

/**
 * Generates access and refresh tokens for a user
 * @param {Object} user - The user object
 * @param {string|null} [oldToken=null] - Optional old refresh token to revoke
 * @param {boolean} [rotateRefreshToken=true] - Whether to generate a new refresh token (true) or only a new access token (false)
 * @returns {Promise<{accessToken: string, refreshToken: string|null}>} - The generated tokens
 */
export const generateTokens = async (user, oldToken = null, rotateRefreshToken = true) => {
    // Generate access token
    const accessToken = jwt.sign(
        {
            userId: user._id,
            username: user.username,
            type: 'access',
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }, // Short-lived; 15 minutes to 1 hour
    );

    // If we don't need to rotate the refresh token, just return the access token
    if (!rotateRefreshToken) {
        return { accessToken, refreshToken: null };
    }

    // Generate refresh token with family ID
    let familyId;

    // If this is a refresh operation, get the family ID from the old token
    if (oldToken) {
        const oldTokenDoc = await RefreshToken.findOne({ token: oldToken });
        if (oldTokenDoc) {
            familyId = oldTokenDoc.familyId;

            // Check for suspicious activity
            const isSuspicious = await RefreshToken.detectSuspiciousActivity(user._id, familyId);

            if (isSuspicious) {
                // Revoke all tokens in this family
                await RefreshToken.revokeFamily(user._id, familyId);
                throw new Error('Suspicious activity detected');
            }
        }
    } else {
        // For new logins, generate a new family ID
        familyId = RefreshToken.generateFamilyId();
    }

    // Generate refresh token
    const refreshToken = jwt.sign(
        {
            userId: user._id,
            type: 'refresh',
            familyId,
        },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn }, // Long-lived; 7 days to 30 days
    );

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Save refresh token to database
    const refreshTokenDoc = new RefreshToken({
        token: refreshToken,
        userId: user._id,
        familyId,
        expiresAt,
    });
    await refreshTokenDoc.save();

    // If there was an old token, revoke it and link to the new one
    if (oldToken) {
        await RefreshToken.revokeToken(oldToken, refreshToken);
    }

    return { accessToken, refreshToken };
};

/**
 * Refreshes the access token using a refresh token
 * @param {string} refreshToken - The refresh token to use
 * @param {boolean} [rotateRefreshToken=false] - Whether to generate a new refresh token (true) or only a new access token (false)
 * @returns {Promise<{accessToken: string, refreshToken: string|null, userId: string}|null>} - The new tokens and user ID, or null if refresh failed
 */
export const refreshTokens = async (refreshToken, rotateRefreshToken = false) => {
    try {
        // Verify refresh token JWT
        const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

        // Check if token exists in database and is not revoked
        const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
        if (!tokenDoc || !tokenDoc.isActive()) {
            return null;
        }

        // Find the user by ID
        const user = await User.findById(decoded.userId, '_id username isBlocked');
        if (!user || user.isBlocked) {
            return null;
        }

        // Generate new tokens (with or without rotating the refresh token)
        const tokens = await generateTokens(user, rotateRefreshToken ? refreshToken : null, rotateRefreshToken);

        return {
            ...tokens,
            userId: user._id.toString(),
        };
    } catch (error) {
        console.error('Refresh token error:', error);
        return null;
    }
};

/**
 * Sets authentication cookies in the response
 * @param {Object} res - Express response object
 * @param {Object} tokens - Object containing accessToken and refreshToken
 */
export const setAuthCookies = (res, tokens) => {
    // Set HttpOnly cookie for accessToken
    res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true, // Prevents JavaScript access
        secure: true, // Always use HTTPS
        sameSite: 'strict', // Strict CSRF protection
        maxAge: config.cookies.accessMaxAge, // Should be the same as token expiration
        path: '/', // Available across the entire site
    });

    // Set HttpOnly cookie for refreshToken if it exists
    if (tokens.refreshToken) {
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true, // Prevents JavaScript access
            secure: true, // Always use HTTPS
            sameSite: 'strict', // Strict CSRF protection
            maxAge: config.cookies.refreshMaxAge, // Should be the same as token expiration
            path: '/api/auth', // Available to all auth endpoints
        });
    }
};

/**
 * Clears authentication cookies in the response
 * @param {Object} res - Express response object
 */
export const clearAuthCookies = (res) => {
    // Clear both cookies with the same options used when setting them
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/api/auth',
    });
};
