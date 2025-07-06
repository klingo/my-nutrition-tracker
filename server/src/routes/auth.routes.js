import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const salt = process.env.PASSWORD_SALT || 10;
const pepper = process.env.PASSWORD_PEPPER || '';

// Helper function to generate tokens
const generateTokens = (user) => {
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
        path: '/api/auth/refresh', // Restrict to refresh endpoint only
    });
};

function decodeData(data) {
    return Object.keys(data).reduce((decodedData, key) => {
        decodedData[key] = Buffer.from(data[key], 'base64').toString('utf-8');
        return decodedData;
    }, {});
}

router.post('/register', async (req, res) => {
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

router.post('/login', async (req, res) => {
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

        const tokens = generateTokens(user);

        // Set authentication cookies
        setAuthCookies(res, tokens);

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Server error');
    }
});

// New endpoint to refresh access token
router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).send({ message: 'Refresh token is required' });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
        } catch (error) {
            console.error('Invalid refresh token:', error.message);
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
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

        // Generate new tokens
        const tokens = generateTokens(user);

        // Set authentication cookies
        setAuthCookies(res, tokens);

        res.json({ message: 'Tokens refreshed successfully' });
    } catch (error) {
        console.error('Refresh error:', error);
        res.status(500).send('Server error');
    }
});

// New endpoint to refresh access token
router.post('/logout', async (req, res) => {
    // Clear both cookies with the same options used when setting them
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        domain: process.env.COOKIE_DOMAIN || undefined,
        path: '/',
    });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        domain: process.env.COOKIE_DOMAIN || undefined,
        path: '/api/auth/refresh',
    });

    res.json({ message: 'Logged out successfully' });
});

// Status endpoint to check authentication status
router.get('/status', auth(), async (req, res) => {
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
