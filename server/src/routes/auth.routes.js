import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

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
        { expiresIn: '1h' }, // Short-lived
    );

    const refreshToken = jwt.sign(
        {
            userId: user._id,
            type: 'refresh',
        },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: '30d' }, // Long-lived
    );

    return { accessToken, refreshToken };
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

        // Validate that either username or email is provided
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
        res.json(tokens);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Server error');
    }
});

// New endpoint to refresh access token
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).send('Refresh token required');
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

        if (decoded.type !== 'refresh') {
            return res.status(401).send('Invalid token type');
        }

        // Get user and generate new access token
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).send('User not found');
        }

        const { accessToken } = generateTokens(user);

        res.json({ accessToken });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).send('Invalid refresh token');
    }
});

export default router;
