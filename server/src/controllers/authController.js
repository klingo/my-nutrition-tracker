import { RefreshToken, User } from '../models/index.js';
import { clearAuthCookies, generateTokens, refreshTokens, setAuthCookies } from '../services/tokenService.js';
import auth from '../middleware/auth.js';
import config from '../config/app.config.js';
import { HEIGHT_UNITS, WEIGHT_UNITS } from '../models/constants/units.js';

function decodeData(data) {
    return Object.keys(data).reduce((decodedData, key) => {
        decodedData[key] = Buffer.from(data[key], 'base64').toString('utf-8');
        return decodedData;
    }, {});
}

export const registerUser = async (req, res) => {
    try {
        let { username, email, password, profile } = req.body;

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

        const user = new User({ username, email, password });
        // Gender
        if (profile.gender) user.profile.gender = profile.gender;
        // Date of birth
        if (profile.dateOfBirth) user.profile.dateOfBirth = profile.dateOfBirth;
        // Height
        if (profile.height) {
            user.profile.height = {
                value: profile.height,
                unit: HEIGHT_UNITS.CENTIMETER,
            };
        }
        // Weight
        if (profile.weight) {
            user.profile.weight = {
                value: profile.weight,
                unit: WEIGHT_UNITS.KILOGRAM,
            };
        }
        await user.save();

        // Generate tokens and set authentication cookies
        const tokens = await generateTokens(user, null, true);
        setAuthCookies(res, tokens);

        res.status(201).json({
            _embedded: {
                user: {
                    username: user.username,
                    email: user.email,
                    accessLevel: user.accessLevel,
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
        const user = await User.findOne(query, '_id username password isBlocked accessLevel loginAttempts');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.isAccountLocked()) {
            return res.status(423).json({
                message: `Account locked. Try again after ${Math.ceil((user.loginAttempts.lockedUntil - new Date()) / 60000)} minutes`,
                lockedUntil: user.loginAttempts.lockedUntil,
            });
        }

        // Validate password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            await user.handleFailedLogin();
            return res.status(401).json({
                message: 'Invalid credentials',
            });
        }

        // Validate account status
        if (user.isBlocked) return res.status(403).json({ message: 'Account blocked.' });

        // Clear failed login attempts
        await user.handleSuccessfulLogin();

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
        const statusCode = error.status || 500;
        const message = error.message || 'An unexpected error occurred';
        res.status(statusCode).json({
            message,
            error: config.env === 'development' ? error.stack : undefined,
        });
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
            return res.status(403).json({ message: 'Invalid or expired refresh token. Please log in again' });
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
            return res.status(401).json({
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
                const user = await User.findById(req.user.userId).select('username email accessLevel').lean();

                if (!user) {
                    return res.status(404).json({
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
            message: 'Server error',
            _embedded: {
                auth: {
                    isAuthenticated: false,
                },
            },
        });
    }
};
