import { EncodeUtil } from '@/common/utils/EncodeUtil.js';

class AuthService {
    constructor() {
        this.loadTokens();
    }

    async login(username, password) {
        try {
            if (!username || !password) {
                throw new Error('Username and password are required');
            }
            const response = await this.apiCall('/api/auth/login', 'POST', {
                username: EncodeUtil.encode(username),
                password: EncodeUtil.encode(password),
                encoded: true,
            });
            this.storeTokens(response.data);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    async isAuthenticated() {
        if (!this.refreshToken || this.isRefreshTokenExpired()) {
            return false;
        }
        if (this.accessToken && !this.isTokenExpired(this.accessToken)) {
            return true;
        }
        return await this.refreshAccessToken();
    }

    async refreshAccessToken() {
        try {
            const response = await this.apiCall('/api/auth/refresh', 'POST', { refreshToken: this.refreshToken });
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
    }

    loadTokens() {
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
    }

    storeTokens({ accessToken, refreshToken }) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    async apiCall(url, method, body) {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Request failed: ${response.statusText}`);
        }
        return { data: await response.json() };
    }
}

export default new AuthService();
