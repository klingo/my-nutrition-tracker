import { EncodeUtil } from '@utils/EncodeUtil.js';

class AuthService {
    constructor() {
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
    }

    async login(username, password) {
        try {
            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            // Simple encoding - hides from Network tab
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: EncodeUtil.encode(username),
                    password: EncodeUtil.encode(password),
                    encoded: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Login failed: ${response.statusText}`);
            }

            const data = await response.json();
            this.accessToken = data.accessToken;
            this.refreshToken = data.refreshToken;

            localStorage.setItem('accessToken', this.accessToken);
            localStorage.setItem('refreshToken', this.refreshToken);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    async isAuthenticated() {
        // No refresh token = not authenticated
        if (!this.refreshToken || this.isRefreshTokenExpired()) {
            return false;
        }

        // Valid access token = authenticated
        if (this.accessToken && !this.isTokenExpired(this.accessToken)) {
            return true;
        }

        // Try to refresh access token
        return await this.refreshAccessToken();
    }

    async refreshAccessToken() {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.refreshToken }),
            });

            if (!response.ok) {
                this.logout();
                return false;
            }

            const data = await response.json();
            this.accessToken = data.accessToken;
            localStorage.setItem('accessToken', this.accessToken);
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

    // Logout user
    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
}

export default new AuthService();
