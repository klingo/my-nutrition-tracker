import { EncodeUtil } from '@/common/utils/EncodeUtil.js';
import callApi from '@common/utils/callApi.js';
import ApiError from '@common/errors/ApiError';

class AuthService {
    constructor() {
        this.loadTokens();
    }

    async login(username, password) {
        try {
            if (!username || !password) {
                throw new Error('Username and password are required');
            }
            const response = await callApi('POST', '/api/auth/login', {
                username: EncodeUtil.encode(username),
                password: EncodeUtil.encode(password),
                encoded: true,
            });
            console.log(`storeTokens from login: ${JSON.stringify(response.data)}`);
            this.storeTokens(response.data);
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
        if (!this.refreshToken || this.isRefreshTokenExpired()) {
            console.log('isAuthenticated: refreshToken is undefined or expired');
            return false;
        }
        if (this.accessToken && !this.isTokenExpired(this.accessToken)) {
            return true;
        }
        return await this.refreshAccessToken();
    }

    async refreshAccessToken() {
        try {
            const response = await callApi('POST', '/api/auth/refresh', { refreshToken: this.refreshToken });
            console.log(`storeTokens from refreshAccessToken: ${JSON.stringify(response.data)}`);
            this.storeTokens(response.data);
            return true;
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            return false;
        }
    }

    isTokenExpired(token = this.accessToken) {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp < Date.now() / 1000;
            if (isExpired) console.log('Token expired at:', new Date(payload.exp * 1000));
            return isExpired;
        } catch (error) {
            console.error('Token validation error:', error);
            return true;
        }
    }

    isRefreshTokenExpired() {
        return this.isTokenExpired(this.refreshToken);
    }

    getToken() {
        return this.accessToken;
    }

    getUserInfo() {
        if (!this.accessToken) return null;
        try {
            const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
            return {
                userId: payload.userId,
                username: payload.username,
            };
        } catch (error) {
            console.error('Token parsing error:', error);
            return null;
        }
    }

    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        console.log('Logged out: accessToken and refreshToken removed from localStorage');
    }

    loadTokens() {
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
        console.log('Loaded tokens from localStorage:', {
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
        });
    }

    storeTokens({ accessToken, refreshToken }) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        console.log('Stored tokens in localStorage:', { accessToken, refreshToken });
    }
}

export default new AuthService();
