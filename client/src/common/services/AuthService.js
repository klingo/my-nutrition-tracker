import { EncodeUtil } from '@/common/utils/EncodeUtil.js';
import callApi from '@common/utils/callApi.js';
import ApiError from '@common/errors/ApiError';

class AuthService {
    constructor() {
        this.userInfo = null;
        this.authenticated = false;
        this.authCheckPromise = null;
    }

    /**
     * Asynchronously checks the authentication status of the user.
     * @return {Promise<void>} This method updates internal state properties `authenticated` and `userInfo`.
     */
    async #checkAuthStatus() {
        try {
            // Make a lightweight API call to check authentication status
            const response = await callApi('GET', '/api/auth/status', null, {
                withCredentials: true,
                skipAuthRefresh: true,
            });
            this.authenticated = response._embedded.auth.isAuthenticated;
            this.userInfo = response._embedded.auth.user;
        } catch (error) {
            console.error('Not authenticated or error checking auth status:', error);
            this.authenticated = false;
            this.userInfo = null;
        }
    }

    /**
     * Attempts to log in a user with the provided credentials.
     * @param {string} username - The username of the user attempting to log in.
     * @param {string} password - The password of the user attempting to log in.
     * @return {Promise<Object>} A promise that resolves to an object indicating whether the login was successful or not. If successful, the object will contain a `success` property set to true. If unsuccessful, the object will contain `success` set to false, along with `status` and `message` properties detailing the error.
     */
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
                    // Apply minimal obfuscation
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
            await this.#checkAuthStatus();

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

    /**
     * Checks if the user is authenticated.
     * @return {Promise<null|boolean>} True if the user is authenticated, otherwise false.
     */
    async isAuthenticated() {
        // If we already checked and are authenticated, return true
        if (this.authenticated && this.userInfo) {
            return true;
        }

        // If there's an ongoing authentication check, wait for it to complete
        if (this.authCheckPromise) {
            await this.authCheckPromise;
            // Re-check the authentication status after promise resolution
            if (this.authenticated && this.userInfo) {
                return true;
            }
        }

        // Otherwise, initiate a new check and store the promise
        this.authCheckPromise = this.#checkAuthStatus();
        try {
            await this.authCheckPromise;
            this.authCheckPromise = null; // Clear the promise after resolution
            return !!(this.authenticated && this.userInfo);
        } catch (error) {
            this.authCheckPromise = null; // Clear the promise on error
            throw error;
        }
    }

    /**
     * Refreshes the access token by calling the server's refresh endpoint.
     * Updates the authentication status and returns true if successful, otherwise logs out and returns false.
     * @return {Promise<boolean>} - True if the access token was successfully refreshed, false otherwise.
     */
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
            await this.#checkAuthStatus();
            return this.authenticated;
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            return false;
        }
    }

    /**
     * Retrieves the user information stored in the object.
     * @return {Object|null} The user information.
     */
    getUserInfo() {
        console.log('getUserInfo()');
        return this.userInfo;
    }

    /**
     * Logs the user out by calling the server's logout endpoint and clearing local authentication state.
     * @return {Promise<void>} Resolves when the logout process is complete, including local state reset.
     */
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
