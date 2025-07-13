import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import AuthService from './AuthService.js';
import callApi from '@common/utils/callApi';
import ApiError from '@common/errors/ApiError';

// Mock the callApi module
vi.mock('@common/utils/callApi');

// Create a mock for EncodeUtil using vi.hoisted
const mockEncodeUtil = vi.hoisted(() => ({
    encode: vi.fn((str) => (str ? Buffer.from(str).toString('base64') : '')),
}));

// Mock the module with the hoisted mock
vi.mock('@/common/utils/EncodeUtil.js', () => ({
    EncodeUtil: mockEncodeUtil,
}));

// Get the actual AuthService instance
const authService = AuthService;

// Mock data
const mockUserInfo = {
    id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
};

// Helper function to reset the singleton instance
const resetAuthService = () => {
    // Reset the instance properties
    authService.userInfo = null;
    authService.authenticated = false;
    authService.authCheckPromise = null;
    // Reset the mock implementation
    mockEncodeUtil.encode.mockImplementation((str) => (str ? Buffer.from(str).toString('base64') : ''));
};

describe('AuthService', () => {
    // Reset the AuthService instance and clear all mocks before each test
    beforeEach(() => {
        resetAuthService();
        vi.clearAllMocks();
    });

    afterEach(() => {
        resetAuthService();
    });

    describe('initial state', () => {
        it('should have default values', () => {
            expect(authService.userInfo).toBeNull();
            expect(authService.authenticated).toBe(false);
            expect(authService.authCheckPromise).toBeNull();
        });
    });

    describe('login', () => {
        const username = 'testuser';
        const password = 'password123';

        beforeEach(() => {
            callApi.mockClear();
            mockEncodeUtil.encode.mockClear();
        });

        it('should successfully login with valid credentials', async () => {
            // Arrange
            // First mock the login call
            callApi.mockResolvedValueOnce({ data: { success: true } });
            // Then mock the auth status check that happens after login
            callApi.mockResolvedValueOnce({
                _embedded: {
                    auth: {
                        isAuthenticated: true,
                        user: mockUserInfo,
                    },
                },
            });

            // Act
            const result = await authService.login(username, password);

            // Assert
            expect(mockEncodeUtil.encode).toHaveBeenCalledTimes(2);
            expect(mockEncodeUtil.encode).toHaveBeenCalledWith(username);
            expect(mockEncodeUtil.encode).toHaveBeenCalledWith(password);

            // Verify login API call
            expect(callApi).toHaveBeenNthCalledWith(
                1,
                'POST',
                '/api/auth/login',
                {
                    username: expect.any(String), // base64 encoded
                    password: expect.any(String), // base64 encoded
                    encoded: true,
                },
                {
                    withCredentials: true,
                    skipAuthRefresh: true,
                },
            );

            // Verify status check API call
            expect(callApi).toHaveBeenNthCalledWith(2, 'GET', '/api/auth/status', null, {
                withCredentials: true,
                skipAuthRefresh: true,
            });

            expect(result).toEqual({ success: true });
            expect(authService.authenticated).toBe(true);
            expect(authService.userInfo).toEqual(mockUserInfo);
        });

        it('should handle invalid credentials', async () => {
            // Arrange
            callApi.mockRejectedValue(new ApiError('Invalid credentials', 401));

            // Act
            const result = await authService.login(username, 'wrongpassword');

            // Assert
            expect(mockEncodeUtil.encode).toHaveBeenCalledTimes(2);
            expect(callApi).toHaveBeenCalledWith(
                'POST',
                '/api/auth/login',
                {
                    username: expect.any(String),
                    password: expect.any(String),
                    encoded: true,
                },
                {
                    withCredentials: true,
                    skipAuthRefresh: true,
                },
            );
            expect(result).toEqual({
                success: false,
                status: 401,
                message: 'Invalid credentials',
            });
            expect(authService.authenticated).toBe(false);
            expect(authService.userInfo).toBeNull();
        });

        it('should handle 403 account blocked error', async () => {
            // Arrange
            callApi.mockRejectedValue(new ApiError('Account blocked', 403));

            // Act
            const result = await authService.login(username, password);

            // Assert
            expect(mockEncodeUtil.encode).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                success: false,
                status: 403,
                message: 'Account blocked',
            });
        });

        it('should handle server errors', async () => {
            // Arrange
            callApi.mockRejectedValue(new ApiError('Server error', 500));

            // Act
            const result = await authService.login(username, password);

            // Assert
            expect(mockEncodeUtil.encode).toHaveBeenCalledTimes(2);
            expect(callApi).toHaveBeenCalledWith(
                'POST',
                '/api/auth/login',
                {
                    username: expect.any(String),
                    password: expect.any(String),
                    encoded: true,
                },
                {
                    withCredentials: true,
                    skipAuthRefresh: true,
                },
            );
            expect(result).toEqual({
                success: false,
                status: 500,
                message: 'Internal server error',
            });
        });

        it('should handle unknown status code errors', async () => {
            // Arrange
            callApi.mockRejectedValue(new ApiError('Unknown error', 418)); // 418 is not specifically handled

            // Act
            const result = await authService.login(username, password);

            // Assert
            expect(mockEncodeUtil.encode).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                success: false,
                status: 418,
                message: 'Technical error',
            });
        });

        it('should handle network errors', async () => {
            // Arrange
            const networkError = new Error('Network error');
            networkError.status = 0;
            callApi.mockRejectedValue(networkError);

            // Act
            const result = await authService.login(username, password);

            // Assert
            expect(mockEncodeUtil.encode).toHaveBeenCalledTimes(2);
            expect(callApi).toHaveBeenCalledWith(
                'POST',
                '/api/auth/login',
                {
                    username: expect.any(String),
                    password: expect.any(String),
                    encoded: true,
                },
                {
                    withCredentials: true,
                    skipAuthRefresh: true,
                },
            );
            expect(result).toEqual({
                success: false,
                status: 0,
                message: 'Network error: Network error',
            });
        });

        it('should handle missing credentials', async () => {
            // Act & Assert - Empty username
            let result = await authService.login('', password);
            expect(result).toEqual({
                success: false,
                status: 0,
                message: 'Network error: Username and password are required',
            });

            // Act & Assert - Empty password
            result = await authService.login(username, '');
            expect(result).toEqual({
                success: false,
                status: 0,
                message: 'Network error: Username and password are required',
            });

            // Act & Assert - Both empty
            result = await authService.login('', '');
            expect(result).toEqual({
                success: false,
                status: 0,
                message: 'Network error: Username and password are required',
            });

            // No API calls should be made for missing credentials
            expect(callApi).not.toHaveBeenCalled();
        });
    });

    describe('logout', () => {
        beforeEach(async () => {
            // Set up a logged-in state
            authService.authenticated = true;
            authService.userInfo = mockUserInfo;
            callApi.mockResolvedValue({});
        });

        it('should log out successfully', async () => {
            // Act
            await authService.logout();

            // Assert
            expect(callApi).toHaveBeenCalledWith(
                'POST',
                '/api/auth/logout',
                {},
                {
                    withCredentials: true,
                    skipAuthRefresh: true,
                },
            );
            expect(authService.authenticated).toBe(false);
            expect(authService.userInfo).toBeNull();
        });

        it('should handle logout errors gracefully', async () => {
            // Arrange
            callApi.mockRejectedValue(new Error('Logout failed'));
            console.error = vi.fn();

            // Act
            await authService.logout();

            // Assert
            expect(console.error).toHaveBeenCalledWith('Logout error:', expect.any(Error));
            expect(authService.authenticated).toBe(false);
            expect(authService.userInfo).toBeNull();
        });
    });

    describe('isAuthenticated', () => {
        beforeEach(() => {
            callApi.mockClear();
            authService.authCheckPromise = null; // Reset auth check promise
        });

        it('should return false when authentication check fails', async () => {
            // Arrange
            const testError = new Error('Auth check failed');
            callApi.mockRejectedValue(testError);

            // Act
            const result = await authService.isAuthenticated();

            // Assert
            expect(result).toBe(false);
            expect(authService.authCheckPromise).toBeNull();
        });

        it('should return true when already authenticated', async () => {
            // Arrange
            authService.authenticated = true;
            authService.userInfo = mockUserInfo;

            // Act
            const result = await authService.isAuthenticated();

            // Assert
            expect(result).toBe(true);
            expect(callApi).not.toHaveBeenCalled();
        });

        it('should check auth status when not authenticated', async () => {
            // Arrange
            callApi.mockResolvedValue({ _embedded: { auth: { isAuthenticated: true, user: mockUserInfo } } });

            // Act
            const result = await authService.isAuthenticated();

            // Assert
            // The method should return a boolean indicating authentication status
            expect(result).toBe(true);
            expect(callApi).toHaveBeenCalledWith('GET', '/api/auth/status', null, {
                skipAuthRefresh: true,
                withCredentials: true,
            });
            expect(authService.authenticated).toBe(true);
            expect(authService.userInfo).toEqual(mockUserInfo);
        });

        it('should handle concurrent auth checks', async () => {
            // Arrange
            callApi.mockImplementation(
                () =>
                    new Promise((resolve) =>
                        setTimeout(
                            () => resolve({ _embedded: { auth: { isAuthenticated: true, user: mockUserInfo } } }),
                            100,
                        ),
                    ),
            );

            // Act - Trigger multiple concurrent auth checks
            const [result1, result2] = await Promise.all([
                authService.isAuthenticated(),
                authService.isAuthenticated(),
            ]);

            // Assert - Only one API call should be made
            expect(callApi).toHaveBeenCalledTimes(1);
            expect(result1).toBe(true);
            expect(result2).toBe(true);
        });
    });

    describe('refreshAccessToken', () => {
        it('should refresh the access token successfully', async () => {
            // Arrange
            callApi.mockResolvedValue({});
            // Mock the isAuthenticated call that refreshAccessToken will make
            callApi.mockResolvedValueOnce({}); // For the refresh call
            callApi.mockResolvedValueOnce({ _embedded: { auth: { isAuthenticated: true, user: mockUserInfo } } }); // For the status check

            // Act
            const result = await authService.refreshAccessToken();

            // Assert
            expect(callApi).toHaveBeenCalledWith(
                'POST',
                '/api/auth/refresh',
                {},
                {
                    withCredentials: true,
                    skipAuthRefresh: true,
                },
            );
            expect(result).toBe(true);
            expect(authService.authenticated).toBe(true);
            expect(authService.userInfo).toEqual(mockUserInfo);
        });

        it('should handle refresh token failure', async () => {
            // Arrange
            callApi.mockRejectedValue(new Error('Refresh token failed'));
            const originalConsoleError = console.error;
            console.error = vi.fn();

            // Act
            const result = await authService.refreshAccessToken();

            // Assert
            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith('Token refresh error:', expect.any(Error));
            expect(authService.authenticated).toBe(false);

            // Cleanup
            console.error = originalConsoleError;
        });
    });

    describe('getUserInfo', () => {
        it('should return user info when available', () => {
            // Arrange
            authService.userInfo = mockUserInfo;

            // Act
            const result = authService.getUserInfo();

            // Assert
            expect(result).toEqual(mockUserInfo);
        });

        it('should return null when user info is not available', () => {
            // Act
            const result = authService.getUserInfo();

            // Assert
            expect(result).toBeNull();
        });
    });

    // Note: Testing private methods directly is not recommended as they're implementation details
    // Instead, we test their behavior through public methods

    describe('authentication flow', () => {
        it('should update auth status when checkAuth is successful', async () => {
            // Arrange
            callApi.mockResolvedValue({ _embedded: { auth: { isAuthenticated: true, user: mockUserInfo } } });

            // Act - isAuthenticated will call the private #checkAuthStatus method
            const result = await authService.isAuthenticated();

            // Assert
            expect(result).toBe(true);
            expect(authService.authenticated).toBe(true);
            expect(authService.userInfo).toEqual(mockUserInfo);
        });

        it('should handle authentication check failure', async () => {
            // Arrange
            callApi.mockRejectedValue(new Error('Auth check failed'));

            // Act - isAuthenticated will call the private #checkAuthStatus method
            const result = await authService.isAuthenticated();

            // Assert
            expect(result).toBe(false);
            expect(authService.authenticated).toBe(false);
            expect(authService.userInfo).toBeNull();
        });
    });
});
