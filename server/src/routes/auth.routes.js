import express from 'express';
import bcrypt from 'bcrypt';
import { User, RefreshToken } from '../models/index.js';
import auth from '../middleware/auth.js';
import { authLimiter, mutationLimiter, refreshLimiter, statusLimiter } from '../middleware/rateLimiters.js';
import { generateTokens, refreshTokens, setAuthCookies, clearAuthCookies } from '../services/tokenService.js';

const router = express.Router();
const salt = process.env.PASSWORD_SALT || 10;
const pepper = process.env.PASSWORD_PEPPER || '';

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
        const tokens = await generateTokens(user, null, true);

        // Set authentication cookies
        setAuthCookies(res, tokens);

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Server error');
    }
});

// Endpoint to refresh access token with token rotation
router.post('/refresh', refreshLimiter, async (req, res) => {
    try {
        const currentRefreshToken = req.cookies.refreshToken;

        if (!currentRefreshToken) {
            return res.status(401).send({ message: 'Refresh token is required' });
        }

        // Refresh tokens with rotation (generate new access and refresh tokens)
        const refreshResult = await refreshTokens(currentRefreshToken, true);
        if (!refreshResult) {
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }

        // Set authentication cookies
        setAuthCookies(res, refreshResult);

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

        // Clear authentication cookies
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
router.get('/status', statusLimiter, async (req, res) => {
    try {
        // Extract tokens from cookies
        const accessToken = req.cookies?.accessToken;
        const refreshToken = req.cookies?.refreshToken;

        // If no tokens at all, user is not authenticated
        if (!accessToken && !refreshToken) {
            return res.json({
                authenticated: false,
                message: 'No authentication tokens',
            });
        }

        // Use the auth middleware as a function to handle token verification and refresh
        return auth()(req, res, async () => {
            try {
                // If we get here, the user is authenticated (auth middleware verified or refreshed the token)
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
            } catch (innerError) {
                console.error('Auth status inner error:', innerError);
                return res.status(500).json({
                    authenticated: false,
                    message: 'Server error',
                });
            }
        });
    } catch (error) {
        console.error('Auth status outer error:', error);
        return res.status(500).json({
            authenticated: false,
            message: 'Server error',
        });
    }
});

export default router;
