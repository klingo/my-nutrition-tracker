import { EncodeUtil } from '@/common/utils/EncodeUtil.js';
import callApi from '@common/utils/callApi.js';
import ApiError from '@common/errors/ApiError';

class AuthService {
    constructor() {
        this.userInfo = null;
        this.authenticated = false;
        this.checkAuthStatus();
    }

    /**
     * Checks the current authentication status by making a lightweight API call
     * This is used on initialization and doesn't need to be called directly
     */
    async checkAuthStatus() {
        try {
            // Make a lightweight API call to check authentication status
            const response = await callApi('GET', '/api/auth/status', null, {
                withCredentials: true,
                skipAuthRefresh: true,
            });
            this.authenticated = response.data.authenticated;
            this.userInfo = response.data.user || null;
        } catch (error) {
            console.error('Not authenticated or error checking auth status:', error);
            this.authenticated = false;
            this.userInfo = null;
        }
    }

    async login(username, password) {
        console.log(`login(${username}, password: ${password})`);
        try {
            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            // Make login request - the server will set HttpOnly cookies
            await callApi(
                'POST',
                '/api/auth/login',
                {
                    username: EncodeUtil.encode(username),
                    password: EncodeUtil.encode(password),
                    encoded: true,
                },
                {
                    withCredentials: true,
                    skipAuthRefresh: true, // Skip token refresh on 401 during login
                },
            );

            // Update authentication status
            await this.checkAuthStatus();

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            if (error instanceof ApiError) {
                switch (error.status) {
                    case 401:
                        return { success: false, status: 401, message: 'Invalid credentials' };
                    case 403:
                        return { success: false, status: 403, message: 'Account blocked' };
                    case 500:
                        return { success: false, status: 500, message: 'Internal server error' };
                    default:
                        return { success: false, status: error.status, message: 'Technical error' };
                }
            } else {
                return { success: false, status: 0, message: `Network error: ${error.message}` };
            }
        }
    }

    async isAuthenticated() {
        console.log('isAuthenticated()');

        // If we already checked and are authenticated, return true
        if (this.authenticated && this.userInfo) {
            return true;
        }

        // Otherwise, check authentication status from server
        await this.checkAuthStatus();
        return this.authenticated;
    }

    async refreshAccessToken() {
        console.log('refreshAccessToken()');
        try {
            // Call the refresh endpoint - the server will set new HttpOnly cookies
            await callApi(
                'POST',
                '/api/auth/refresh',
                {},
                {
                    withCredentials: true,
                    skipAuthRefresh: true, // Prevent infinite loop
                },
            );

            // Update authentication status
            await this.checkAuthStatus();
            return this.authenticated;
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            return false;
        }
    }

    getUserInfo() {
        console.log('getUserInfo()');
        return this.userInfo;
    }

    async logout() {
        console.log('Logging out...');

        try {
            // Call the server logout endpoint to clear HttpOnly cookies
            await callApi(
                'POST',
                '/api/auth/logout',
                {},
                {
                    withCredentials: true,
                    skipAuthRefresh: true,
                },
            );
        } catch (error) {
            console.error('Logout error:', error);
            // Continue with local logout even if server logout fails
        }

        // Reset local state
        this.authenticated = false;
        this.userInfo = null;

        console.log('Logged out successfully');
    }
}

export default new AuthService();
