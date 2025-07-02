import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * Authentication middleware that verifies the JWT token and optionally checks user access level
 * @param {number} minAccessLevel - Minimum access level required to access the endpoint (optional)
 * @returns {function} - Express middleware function
 */
const auth = (minAccessLevel = 0) => {
    return async (req, res, next) => {
        try {
            // Extract token from Authorization header
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) return res.status(401).send('Unauthorized');

            // Verify token
            req.user = jwt.verify(token, process.env.JWT_SECRET);

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
