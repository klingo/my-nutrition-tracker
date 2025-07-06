import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, RefreshToken } from '../models/index.js';
import auth from '../middleware/auth.js';
import { authLimiter, mutationLimiter, queryLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();
const salt = process.env.PASSWORD_SALT || 10;
const pepper = process.env.PASSWORD_PEPPER || '';

// Helper function to generate tokens and save refresh token to database
const generateTokens = async (user, oldToken = null) => {
    const accessToken = jwt.sign(
        {
            userId: user._id,
            username: user.username,
            type: 'access',
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }, // Short-lived; 15 minutes to 1 hour
    );

    const refreshToken = jwt.sign(
        {
            userId: user._id,
            type: 'refresh',
        },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: '30d' }, // Long-lived; 7 days to 30 days
    );

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Save refresh token to database
    const refreshTokenDoc = new RefreshToken({
        token: refreshToken,
        userId: user._id,
        expiresAt,
    });
    await refreshTokenDoc.save();

    // If there was an old token, revoke it and link to the new one
    if (oldToken) {
        await RefreshToken.revokeToken(oldToken, refreshToken);
    }

    return { accessToken, refreshToken };
};

// Helper function to set authentication cookies
const setAuthCookies = (res, tokens) => {
    // Set HttpOnly cookies for both accessToken and refreshToken with enhanced security
    res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true, // Prevents JavaScript access
        secure: true, // Always use HTTPS
        sameSite: 'strict', // Strict CSRF protection
        maxAge: 15 * 60 * 1000, // 15 minutes, same as token expiration
        path: '/', // Available across the entire site
    });

    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true, // Prevents JavaScript access
        secure: true, // Always use HTTPS
        sameSite: 'strict', // Strict CSRF protection
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, same as token expiration
        path: '/api/auth', // Available to all auth endpoints
    });
};

// Helper function to clear authentication cookies
const clearAuthCookies = (res) => {
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

function decodeData(data) {
    return Object.keys(data).reduce((decodedData, key) => {
        decodedData[key] = Buffer.from(data[key], 'base64').toString('utf-8');
        return decodedData;
    }, {});
}

router.post('/register', authLimiter, async (req, res) => {
    try {
        let { username, email, password } = req.body;

        // Decode if encoded (simple base64 decoding)
        if (req.body.encoded) {
            try {
                [username, email, password] = decodeData({ username, email, password });
            } catch {
                return res.status(400).json({ message: 'Invalid encoded data' });
            }
        }

        // Validate that username, email and password are provided
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password + pepper, salt);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.send('User registered');
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).send('Server error');
    }
});

router.post('/login', authLimiter, async (req, res) => {
    try {
        let { username, password } = req.body;

        // Decode if encoded (simple base64 decoding)
        if (req.body.encoded) {
            try {
                ({ username, password } = decodeData({ username, password }));
            } catch {
                return res.status(400).json({ message: 'Invalid encoded data' });
            }
        }

        // Validate that username and password are provided
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password is required' });
        }

        const normalizedUsername = username.toLowerCase().trim();

        // Find user by username or email
        const query = { $or: [{ username: normalizedUsername }, { email: normalizedUsername }] };
        const user = await User.findOne(query, '_id username password isBlocked');
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        // Validate password
        const isPasswordValid = await bcrypt.compare(password + pepper, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

        // Validate account status
        if (user.isBlocked) return res.status(403).json({ message: 'Account blocked' });

        // Generate tokens and save refresh token to database
        const tokens = await generateTokens(user);

        // Set authentication cookies
        setAuthCookies(res, tokens);

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Server error');
    }
});

// Endpoint to refresh access token with token rotation
router.post('/refresh', mutationLimiter, async (req, res) => {
    try {
        const currentRefreshToken = req.cookies.refreshToken;

        if (!currentRefreshToken) {
            return res.status(401).send({ message: 'Refresh token is required' });
        }

        // Verify refresh token JWT
        let decoded;
        try {
            decoded = jwt.verify(currentRefreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
        } catch (error) {
            console.error('Invalid refresh token:', error.message);
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }

        // Check if token exists in database and is not revoked
        const tokenDoc = await RefreshToken.findOne({ token: currentRefreshToken });
        if (!tokenDoc || !tokenDoc.isActive()) {
            return res.status(403).json({ message: 'Refresh token has been revoked or expired' });
        }

        // Find the user by ID
        const user = await User.findById(decoded.userId, '_id username isBlocked');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Validate account status
        if (user.isBlocked) {
            return res.status(403).json({ message: 'Account blocked' });
        }

        // Generate new tokens with token rotation (this will revoke the old token)
        const tokens = await generateTokens(user, currentRefreshToken);

        // Set authentication cookies
        setAuthCookies(res, tokens);

        res.json({ message: 'Tokens refreshed successfully' });
    } catch (error) {
        console.error('Refresh error:', error);
        res.status(500).send('Server error');
    }
});

// Logout endpoint - revokes refresh token and clears cookies
router.post('/logout', mutationLimiter, async (req, res) => {
    try {
        // Get the refresh token from cookies
        const refreshToken = req.cookies.refreshToken;

        // If there's a refresh token, revoke it in the database
        if (refreshToken) {
            await RefreshToken.revokeToken(refreshToken);
        }

        // Clear both cookies with the same options used when setting them
        clearAuthCookies(res);

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        // Still clear cookies even if there was an error revoking the token
        clearAuthCookies(res);
        res.status(200).json({ message: 'Logged out successfully' });
    }
});

// Status endpoint to check authentication status
router.get('/status', queryLimiter, auth(), async (req, res) => {
    try {
        // If we get here, the user is authenticated (auth middleware verified the token)
        // Fetch minimal user data
        const user = await User.findById(req.user.userId).select('username');

        if (!user) {
            return res.status(404).json({
                authenticated: false,
                message: 'User not found',
            });
        }

        return res.json({
            authenticated: true,
            user: {
                // userId: user._id,
                username: user.username,
            },
        });
    } catch (error) {
        console.error('Auth status error:', error);
        return res.status(500).json({
            authenticated: false,
            message: 'Server error',
        });
    }
});

export default router;
