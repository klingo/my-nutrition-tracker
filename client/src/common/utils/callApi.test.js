import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import callApi from './callApi';
import ApiError from '@common/errors/ApiError';
import authService from '@common/services/AuthService.js';

vi.mock('@common/services/AuthService.js');

describe('callApi', () => {
    const mockUrl = 'https://api.example.com/data';
    const mockMethod = 'GET';
    const mockBody = { key: 'value' };
    const mockHeaders = { CustomHeader: 'CustomValue' };

    beforeEach(() => {
        // Reset mocks before each test
        vi.resetAllMocks();

        // Mock fetch globally
        global.fetch = vi.fn();

        // Reset the isRefreshing flag by re-importing the module
        vi.resetModules();

        // Default mock implementation for authService.refreshAccessToken
        authService.refreshAccessToken = vi.fn().mockResolvedValue(false);
    });

    afterEach(() => {
        // Clean up after each test
        vi.restoreAllMocks();
    });

    describe('when the API call is successful', () => {
        it('should return the response data', async () => {
            const mockResponseData = { success: true, message: 'Data fetched successfully' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                headers: {
                    get: vi.fn().mockReturnValue('application/json'),
                },
                json: vi.fn().mockResolvedValue(mockResponseData),
            });

            const result = await callApi(mockMethod, mockUrl, mockBody, mockHeaders);

            expect(result.data).toEqual(mockResponseData);
        });
    });

    describe('when the API call fails with a response error', () => {
        it('should throw an ApiError with the correct message and status when JSON parsing succeeds', async () => {
            const mockErrorResponse = { message: 'Resource not found' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                json: vi.fn().mockResolvedValue(mockErrorResponse),
            });

            await expect(callApi(mockMethod, mockUrl, mockBody, mockHeaders)).rejects.toThrowError(
                new ApiError('Resource not found', 404, expect.anything()),
            );
        });

        it('should throw an ApiError with the correct message and status when JSON parsing fails and statusText is used', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: vi.fn().mockRejectedValue(new Error('Failed to parse JSON')),
            });

            await expect(callApi(mockMethod, mockUrl, mockBody, mockHeaders)).rejects.toThrowError(
                new ApiError('Request failed: Internal Server Error', 500, expect.anything()),
            );
        });
    });

    describe('when withCredentials option is set to true', () => {
        it('should include credentials in the request', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                headers: {
                    get: vi.fn().mockReturnValue('application/json'),
                },
                json: vi.fn().mockResolvedValue({}),
            });

            await callApi(mockMethod, mockUrl, mockBody, {
                headers: mockHeaders,
                withCredentials: true,
            });

            expect(global.fetch).toHaveBeenCalledWith(
                mockUrl,
                expect.objectContaining({
                    headers: {
                        'Content-Type': 'application/json',
                        CustomHeader: 'CustomValue',
                    },
                    credentials: 'include',
                }),
            );
        });
    });

    describe('when withCredentials option is not set', () => {
        it('should use same-origin credentials by default', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                headers: {
                    get: vi.fn().mockReturnValue('application/json'),
                },
                json: vi.fn().mockResolvedValue({}),
            });

            await callApi(mockMethod, mockUrl, mockBody, { headers: mockHeaders });

            expect(global.fetch).toHaveBeenCalledWith(
                mockUrl,
                expect.objectContaining({
                    headers: {
                        'Content-Type': 'application/json',
                        CustomHeader: 'CustomValue',
                    },
                    credentials: 'same-origin',
                }),
            );
        });
    });

    describe('when the API call includes a body', () => {
        it('should include the body in requestOptions for POST requests', async () => {
            const mockResponseData = { success: true, message: 'Data posted successfully' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                headers: {
                    get: vi.fn().mockReturnValue('application/json'),
                },
                json: vi.fn().mockResolvedValue(mockResponseData),
            });

            await callApi('POST', mockUrl, mockBody, { headers: mockHeaders });

            expect(global.fetch).toHaveBeenCalledWith(
                mockUrl,
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        CustomHeader: 'CustomValue',
                    },
                    body: JSON.stringify(mockBody),
                }),
            );
        });

        it('should include the body in requestOptions for PUT requests', async () => {
            const mockResponseData = { success: true, message: 'Data updated successfully' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                headers: {
                    get: vi.fn().mockReturnValue('application/json'),
                },
                json: vi.fn().mockResolvedValue(mockResponseData),
            });

            await callApi('PUT', mockUrl, mockBody, { headers: mockHeaders });

            expect(global.fetch).toHaveBeenCalledWith(
                mockUrl,
                expect.objectContaining({
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        CustomHeader: 'CustomValue',
                    },
                    body: JSON.stringify(mockBody),
                }),
            );
        });

        it('should include the body in requestOptions for PATCH requests', async () => {
            const mockResponseData = { success: true, message: 'Data partially updated successfully' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                headers: {
                    get: vi.fn().mockReturnValue('application/json'),
                },
                json: vi.fn().mockResolvedValue(mockResponseData),
            });

            await callApi('PATCH', mockUrl, mockBody, { headers: mockHeaders });

            expect(global.fetch).toHaveBeenCalledWith(
                mockUrl,
                expect.objectContaining({
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        CustomHeader: 'CustomValue',
                    },
                    body: JSON.stringify(mockBody),
                }),
            );
        });

        it('should not include the body in requestOptions for GET requests', async () => {
            const mockResponseData = { success: true, message: 'Data fetched successfully' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                headers: {
                    get: vi.fn().mockReturnValue('application/json'),
                },
                json: vi.fn().mockResolvedValue(mockResponseData),
            });

            await callApi('GET', mockUrl, mockBody, { headers: mockHeaders });

            expect(global.fetch).toHaveBeenCalledWith(
                mockUrl,
                expect.objectContaining({
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        CustomHeader: 'CustomValue',
                    },
                }),
            );
        });

        it('should not include the body in requestOptions when body is null', async () => {
            const mockResponseData = { success: true, message: 'Data fetched successfully' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                headers: {
                    get: vi.fn().mockReturnValue('application/json'),
                },
                json: vi.fn().mockResolvedValue(mockResponseData),
            });

            await callApi('POST', mockUrl, null, { headers: mockHeaders });

            expect(global.fetch).toHaveBeenCalledWith(
                mockUrl,
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        CustomHeader: 'CustomValue',
                    },
                }),
            );
        });

        it('should not include the body in requestOptions when body is undefined', async () => {
            const mockResponseData = { success: true, message: 'Data fetched successfully' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                headers: {
                    get: vi.fn().mockReturnValue('application/json'),
                },
                json: vi.fn().mockResolvedValue(mockResponseData),
            });

            await callApi('POST', mockUrl, undefined, { headers: mockHeaders });

            expect(global.fetch).toHaveBeenCalledWith(
                mockUrl,
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        CustomHeader: 'CustomValue',
                    },
                }),
            );
        });
    });

    describe('when the API call fails with a network error', () => {
        it('should throw an ApiError with the correct message and status when error.message is present', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network timeout'));

            await expect(callApi(mockMethod, mockUrl, mockBody, mockHeaders)).rejects.toThrowError(
                new ApiError('Network error: Network timeout', 0, null),
            );
        });

        it('should throw an ApiError with a generic message when error.message is not present', async () => {
            global.fetch = vi.fn().mockRejectedValue({});

            await expect(callApi(mockMethod, mockUrl, mockBody, mockHeaders)).rejects.toThrowError(
                new ApiError('Network error: Unknown network error', 0, null),
            );
        });
    });

    describe('when the response cannot be parsed as JSON', () => {
        it('should handle JSON parsing failure gracefully and use statusText when no message is provided in errorData', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: vi.fn().mockRejectedValue(new Error('Failed to parse JSON')),
            });

            await expect(callApi(mockMethod, mockUrl, mockBody, mockHeaders)).rejects.toThrowError(
                new ApiError('Request failed: Internal Server Error', 500, expect.anything()),
            );
        });

        it('should handle JSON parsing success and use specific message from response when available', async () => {
            const mockErrorResponse = { message: 'Resource not found' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                json: vi.fn().mockResolvedValue(mockErrorResponse),
            });

            await expect(callApi(mockMethod, mockUrl, mockBody, mockHeaders)).rejects.toThrowError(
                new ApiError('Resource not found', 404, expect.anything()),
            );
        });
    });

    describe('when a non-ApiError exception is thrown', () => {
        it('should rethrow the error as an ApiError with the correct message when error.message is present', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Unexpected network issue'));

            await expect(callApi(mockMethod, mockUrl, mockBody, mockHeaders)).rejects.toThrowError(
                new ApiError('Network error: Unexpected network issue', 0, null),
            );
        });

        it('should rethrow the error as an ApiError with a generic message when error.message is not present', async () => {
            global.fetch = vi.fn().mockRejectedValue({});

            await expect(callApi(mockMethod, mockUrl, mockBody, mockHeaders)).rejects.toThrowError(
                new ApiError('Network error: Unknown network error', 0, null),
            );
        });
    });

    describe('when a non-ApiError exception is thrown with no message property', () => {
        it('should rethrow the error as an ApiError using statusText', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: vi.fn().mockRejectedValue(new Error('Failed to parse JSON')),
            });

            await expect(callApi(mockMethod, mockUrl, mockBody, mockHeaders)).rejects.toThrowError(
                new ApiError('Request failed: Internal Server Error', 500, expect.anything()),
            );
        });
    });

    describe('when handling responses with different content types', () => {
        it('should return an empty object for non-JSON responses', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                headers: {
                    get: vi.fn().mockReturnValue('text/plain'),
                },
            });

            const result = await callApi(mockMethod, mockUrl, mockBody, mockHeaders);
            expect(result.data).toEqual({});
        });

        it('should return an empty object for responses with no content-type header', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                headers: {
                    get: vi.fn().mockReturnValue(null),
                },
            });

            const result = await callApi(mockMethod, mockUrl, mockBody, mockHeaders);
            expect(result.data).toEqual({});
        });

        it('should parse and return JSON data for responses with application/json content-type', async () => {
            const mockResponseData = { success: true, message: 'Data fetched successfully' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                headers: {
                    get: vi.fn().mockReturnValue('application/json'),
                },
                json: vi.fn().mockResolvedValue(mockResponseData),
            });

            const result = await callApi(mockMethod, mockUrl, mockBody, mockHeaders);
            expect(result.data).toEqual(mockResponseData);
        });
    });

    describe('when handling token refresh', () => {
        it('should attempt to refresh the token when receiving a 401 response', async () => {
            // First call returns 401, second call (after token refresh) returns success
            global.fetch = vi
                .fn()
                .mockResolvedValueOnce({
                    ok: false,
                    status: 401,
                    json: vi.fn().mockResolvedValue({ message: 'Unauthorized' }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    headers: {
                        get: vi.fn().mockReturnValue('application/json'),
                    },
                    json: vi.fn().mockResolvedValue({ success: true }),
                });

            // Mock successful token refresh
            authService.refreshAccessToken.mockResolvedValue(true);

            const result = await callApi(mockMethod, mockUrl, mockBody, {
                headers: mockHeaders,
                withCredentials: true,
            });

            // Verify token refresh was attempted
            expect(authService.refreshAccessToken).toHaveBeenCalledTimes(1);

            // Verify fetch was called twice (original + retry)
            expect(global.fetch).toHaveBeenCalledTimes(2);

            // Verify the result is from the second call
            expect(result.data).toEqual({ success: true });
        });

        it('should not attempt to refresh the token when skipAuthRefresh is true', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                json: vi.fn().mockResolvedValue({ message: 'Unauthorized' }),
            });

            // Try to call API with skipAuthRefresh set to true
            await expect(
                callApi(mockMethod, mockUrl, mockBody, {
                    headers: mockHeaders,
                    withCredentials: true,
                    skipAuthRefresh: true,
                }),
            ).rejects.toThrowError(new ApiError('Unauthorized', 401, expect.anything()));

            // Verify token refresh was not attempted
            expect(authService.refreshAccessToken).not.toHaveBeenCalled();

            // Verify fetch was called only once
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should throw an error when token refresh fails', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                json: vi.fn().mockResolvedValue({ message: 'Unauthorized' }),
            });

            // Mock failed token refresh
            authService.refreshAccessToken.mockResolvedValue(false);

            await expect(
                callApi(mockMethod, mockUrl, mockBody, {
                    headers: mockHeaders,
                    withCredentials: true,
                }),
            ).rejects.toThrowError(new ApiError('Unauthorized', 401, expect.anything()));

            // Verify token refresh was attempted
            expect(authService.refreshAccessToken).toHaveBeenCalledTimes(1);

            // Verify fetch was called only once (no retry)
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should throw an error when token refresh throws an exception', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                json: vi.fn().mockResolvedValue({ message: 'Unauthorized' }),
            });

            // Mock token refresh throwing an error
            authService.refreshAccessToken.mockRejectedValue(new Error('Refresh failed'));

            await expect(
                callApi(mockMethod, mockUrl, mockBody, {
                    headers: mockHeaders,
                    withCredentials: true,
                }),
            ).rejects.toThrowError(new ApiError('Unauthorized', 401, expect.anything()));

            // Verify token refresh was attempted
            expect(authService.refreshAccessToken).toHaveBeenCalledTimes(1);

            // Verify fetch was called only once (no retry)
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should prevent infinite refresh loops with isRefreshing flag', async () => {
            // Create three responses: two 401s and one success for the retry
            const unauthorizedResponse = {
                ok: false,
                status: 401,
                json: vi.fn().mockResolvedValue({ message: 'Unauthorized' }),
            };

            const successResponse = {
                ok: true,
                headers: {
                    get: vi.fn().mockReturnValue('application/json'),
                },
                json: vi.fn().mockResolvedValue({ success: true }),
            };

            // First two calls return 401, third call (after token refresh) returns success
            global.fetch = vi
                .fn()
                .mockResolvedValueOnce(unauthorizedResponse) // First request fails
                .mockResolvedValueOnce(unauthorizedResponse) // Second request also fails
                .mockResolvedValueOnce(successResponse); // Retry succeeds

            // Mock successful token refresh
            authService.refreshAccessToken.mockResolvedValue(true);

            // Make two concurrent API calls that will both get 401s
            const firstCall = callApi(mockMethod, mockUrl, mockBody, {
                headers: mockHeaders,
                withCredentials: true,
            });

            const secondCall = callApi(mockMethod, mockUrl, mockBody, {
                headers: mockHeaders,
                withCredentials: true,
            });

            // Wait for both calls to complete
            await Promise.all([firstCall, secondCall]).catch(() => {});

            // Verify refreshAccessToken was called exactly once
            expect(authService.refreshAccessToken).toHaveBeenCalledTimes(1);

            // Verify fetch was called exactly 3 times:
            // 1. First original request (401)
            // 2. Second original request (401)
            // 3. One retry after refresh (success)
            expect(global.fetch).toHaveBeenCalledTimes(3);
        });
    });
});
