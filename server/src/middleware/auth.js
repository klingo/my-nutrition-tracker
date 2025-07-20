import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { refreshTokens, setAuthCookies } from '../services/tokenService.js';
import config from '../config/app.config.js';

/**
 * Authentication middleware that verifies the JWT token and optionally checks user access level
 * If the access token is expired but a valid refresh token is present, it will automatically refresh the access token
 * @param {number} minAccessLevel - Minimum access level required to access the endpoint (optional)
 * @returns {function} - Express middleware function
 */
const auth = (minAccessLevel = 0) => {
    return async (req, res, next) => {
        try {
            // Extract tokens from cookies
            const accessToken = req.cookies?.accessToken;
            const refreshToken = req.cookies?.refreshToken;

            // If no access token, try to refresh using refresh token
            if (!accessToken) {
                if (!refreshToken) {
                    return res.status(401).send('Unauthorized');
                }

                // Try to refresh the access token
                const refreshResult = await refreshTokens(refreshToken, false);
                if (!refreshResult) {
                    return res.status(401).send('Unauthorized');
                }

                // Set the new access token in cookies
                setAuthCookies(res, refreshResult);

                // Set user info for the request
                req.user = { userId: refreshResult.userId };
            } else {
                // Verify existing access token
                try {
                    req.user = jwt.verify(accessToken, config.jwt.secret);
                } catch (tokenError) {
                    console.error('Token error:', tokenError);
                    // If token verification fails, try to refresh using refresh token
                    if (!refreshToken) {
                        return res.status(401).send('Unauthorized');
                    }

                    // Try to refresh the access token
                    const refreshResult = await refreshTokens(refreshToken, false);
                    if (!refreshResult) {
                        return res.status(401).send('Unauthorized');
                    }

                    // Set the new access token in cookies
                    setAuthCookies(res, refreshResult);

                    // Set user info for the request
                    req.user = { userId: refreshResult.userId };
                }
            }

            // If minAccessLevel is specified, check user's access level
            if (minAccessLevel > 0) {
                // Fetch user from database to get current access level
                const user = await User.findById(req.user.userId).select('accessLevel isBlocked');

                // Check if user exists
                if (!user) {
                    return res.status(401).send('User not found');
                }

                // Check if user is blocked
                if (user.isBlocked) {
                    return res.status(403).send('Account blocked');
                }

                // Check if user has sufficient access level
                if (user.accessLevel < minAccessLevel) {
                    return res.status(403).send('Insufficient access level');
                }
            }

            next();
        } catch (error) {
            console.error('Auth error:', error);
            res.status(401).send('Unauthorized');
        }
    };
};

export default auth;
