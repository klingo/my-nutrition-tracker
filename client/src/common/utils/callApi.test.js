import { describe, expect, it, vi } from 'vitest';
import callApi from './callApi';
import ApiError from '@common/errors/ApiError';
import authService from '@common/services/AuthService.js';

vi.mock('fetch');
vi.mock('@common/services/AuthService.js');

describe('callApi', () => {
    const mockUrl = 'https://api.example.com/data';
    const mockMethod = 'GET';
    const mockBody = { key: 'value' };
    const mockHeaders = { CustomHeader: 'CustomValue' };

    describe('when the API call is successful', () => {
        it('should return the response data', async () => {
            const mockResponseData = { success: true, message: 'Data fetched successfully' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
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

    describe('when the auth service returns a token', () => {
        it('should include the Authorization header in the request', async () => {
            const mockToken = 'placeholder-token';
            authService.getToken.mockReturnValue(mockToken);

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({}),
            });

            await callApi(mockMethod, mockUrl, mockBody, mockHeaders);

            expect(global.fetch).toHaveBeenCalledWith(
                mockUrl,
                expect.objectContaining({
                    headers: {
                        'Content-Type': 'application/json',
                        CustomHeader: 'CustomValue',
                        Authorization: `Bearer ${mockToken}`,
                    },
                }),
            );
        });
    });

    describe('when the auth service does not return a token', () => {
        it('should not include the Authorization header in the request', async () => {
            authService.getToken.mockReturnValue(null);

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({}),
            });

            await callApi(mockMethod, mockUrl, mockBody, mockHeaders);

            expect(global.fetch).toHaveBeenCalledWith(
                mockUrl,
                expect.objectContaining({
                    headers: {
                        'Content-Type': 'application/json',
                        CustomHeader: 'CustomValue',
                    },
                }),
            );
        });
    });

    describe('when the API call includes a body', () => {
        it('should include the body in requestOptions for POST requests', async () => {
            const mockResponseData = { success: true, message: 'Data posted successfully' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockResponseData),
            });

            await callApi('POST', mockUrl, mockBody, mockHeaders);

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
                json: vi.fn().mockResolvedValue(mockResponseData),
            });

            await callApi('PUT', mockUrl, mockBody, mockHeaders);

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
                json: vi.fn().mockResolvedValue(mockResponseData),
            });

            await callApi('PATCH', mockUrl, mockBody, mockHeaders);

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
                json: vi.fn().mockResolvedValue(mockResponseData),
            });

            await callApi('GET', mockUrl, mockBody, mockHeaders);

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
                json: vi.fn().mockResolvedValue(mockResponseData),
            });

            await callApi('POST', mockUrl, null, mockHeaders);

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
                json: vi.fn().mockResolvedValue(mockResponseData),
            });

            await callApi('POST', mockUrl, undefined, mockHeaders);

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
});
