import bcrypt from 'bcrypt';
import { RefreshToken, User } from '../models/index.js';
import { clearAuthCookies, generateTokens, refreshTokens, setAuthCookies } from '../services/tokenService.js';
import auth from '../middleware/auth.js';

const saltRounds = parseInt(process.env.PASSWORD_SALT_ROUNDS) || 10;
const pepper = process.env.PASSWORD_PEPPER || '';

function decodeData(data) {
    return Object.keys(data).reduce((decodedData, key) => {
        decodedData[key] = Buffer.from(data[key], 'base64').toString('utf-8');
        return decodedData;
    }, {});
}

export const registerUser = async (req, res) => {
    try {
        let { username, email, password } = req.body;

        // Decode if encoded (simple base64 decoding)
        if (req.body.encoded) {
            try {
                const decodedData = decodeData({ username, email, password });
                ({ username, email, password } = decodedData);
            } catch {
                return res.status(400).json({ message: 'Invalid encoded data' });
            }
        }

        // Validate that username, email and password are provided
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password + pepper, saltRounds);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        res.status(201).json({
            _embedded: {
                user: {
                    username: user.username,
                    email: user.email,
                },
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const loginUser = async (req, res) => {
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
            return res.status(400).json({ message: 'Username and password are required' });
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

        res.json({
            _embedded: {
                user: {
                    username: user.username,
                    accessLevel: user.accessLevel,
                },
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const refreshUserTokens = async (req, res) => {
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
        res.status(500).json({ message: 'Server error' });
    }
};

export const logoutUser = async (req, res) => {
    try {
        // Get the refresh token from cookies
        const refreshToken = req.cookies.refreshToken;

        // If there's a refresh token, revoke it in the database
        if (refreshToken) {
            await RefreshToken.revokeToken(refreshToken);
        }

        // Clear authentication cookies
        clearAuthCookies(res);

        res.json({
            message: 'Logged out successfully',
            _embedded: {
                auth: {
                    isAuthenticated: false,
                },
            },
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Error logging out' });
    }
};

export const logoutUserEverywhere = async (req, res) => {
    try {
        // Revoke all refresh tokens for this user
        await RefreshToken.revokeAllForUser(req.user.userId);

        // Clear authentication cookies
        clearAuthCookies(res);

        res.json({
            message: 'Logged out successfully from all devices',
            _embedded: {
                auth: {
                    isAuthenticated: false,
                },
            },
        });
    } catch (error) {
        console.error('Logout everywhere error:', error);
        res.status(500).json({ message: 'Error logging out from all devices' });
    }
};

export const checkAuthStatus = async (req, res) => {
    try {
        // Extract tokens from cookies
        const accessToken = req.cookies?.accessToken;
        const refreshToken = req.cookies?.refreshToken;

        // If no tokens at all, user is not authenticated
        if (!accessToken && !refreshToken) {
            return res.json({
                authenticated: false,
                message: 'No authentication tokens',
                _embedded: {
                    auth: {
                        isAuthenticated: false,
                    },
                },
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
                        _embedded: {
                            auth: {
                                isAuthenticated: false,
                            },
                        },
                    });
                }

                return res.json({
                    message: 'User is authenticated',
                    _embedded: {
                        auth: {
                            isAuthenticated: true,
                            user: {
                                username: user.username,
                                email: user.email,
                                accessLevel: user.accessLevel,
                            },
                        },
                    },
                });
            } catch (innerError) {
                console.error('Auth status inner error:', innerError);
                return res.status(500).json({
                    authenticated: false,
                    message: 'Server error',
                    _embedded: {
                        auth: {
                            isAuthenticated: false,
                        },
                    },
                });
            }
        });
    } catch (error) {
        console.error('Auth status outer error:', error);
        return res.status(500).json({
            authenticated: false,
            message: 'Server error',
            _embedded: {
                auth: {
                    isAuthenticated: false,
                },
            },
        });
    }
};
