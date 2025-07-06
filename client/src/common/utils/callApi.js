import ApiError from '@common/errors/ApiError';
import authService from '@common/services/AuthService.js';

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

// Flag to prevent infinite refresh loops
let isRefreshing = false;

/**
 * Makes an API call with support for HttpOnly cookies and automatic token refresh
 * @param {string} method - The HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} url - The API endpoint URL
 * @param {object} body - The request body (for POST, PUT, etc.)
 * @param {object} options - Additional options (headers, withCredentials, skipAuthRefresh)
 * @returns {Promise<object>} - The API response
 */
async function callApi(method, url, body, options = {}) {
    const { headers = {}, withCredentials = false, skipAuthRefresh = false } = options;

    const mergedHeaders = {
        ...DEFAULT_HEADERS,
        ...headers,
    };

    try {
        const requestOptions = {
            method,
            headers: mergedHeaders,
            credentials: withCredentials ? 'include' : 'same-origin', // Include cookies when withCredentials is true
        };

        // Include body only for methods that typically allow it and if body is not empty
        if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body !== null && body !== undefined) {
            requestOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, requestOptions);

        // Handle 401 Unauthorized - attempt to refresh token and retry the request
        if (response.status === 401 && !skipAuthRefresh && !isRefreshing) {
            console.log('Received 401, attempting to refresh token...');

            // Prevent multiple simultaneous refresh attempts
            isRefreshing = true;

            try {
                // Attempt to refresh the token
                const refreshed = await authService.refreshAccessToken();
                isRefreshing = false;

                if (refreshed) {
                    console.log('Token refreshed successfully, retrying original request');
                    // Retry the original request with the new token
                    return await callApi(method, url, body, options);
                } else {
                    console.log('Token refresh failed');
                    throw await handleError(response);
                }
            } catch (refreshError) {
                isRefreshing = false;
                console.error('Token refresh error:', refreshError);
                throw await handleError(response);
            }
        }

        if (!response.ok) {
            throw await handleError(response);
        }

        // Handle empty responses (like 204 No Content)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return { data: await response.json() };
        } else {
            return { data: {} };
        }
    } catch (error) {
        console.error('API Call Error:', error);
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError(`Network error: ${error.message || 'Unknown network error'}`, 0, null);
        }
    }
}

async function handleError(response) {
    let errorData;
    try {
        errorData = await response.json();
    } catch (jsonError) {
        console.error(jsonError);
        // If parsing fails, use the statusText
        throw new ApiError(`Request failed: ${response.statusText}`, response.status, response);
    }
    throw new ApiError(errorData.message || `Request failed: ${response.statusText}`, response.status, response);
}

export default callApi;
