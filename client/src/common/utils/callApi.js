import ApiError from '@common/errors/ApiError';
import authService from '@common/services/AuthService.js';

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

// Flag to prevent infinite refresh loops
let isRefreshing = false;

// Store CSRF token in memory
let csrfToken = null;

/**
 * Fetches the CSRF token by making an API call and reading the token from the cookies.
 * The token is retrieved from the 'csrf_token' cookie, which must be set by the server.
 *
 * @return {Promise<string|null>} A promise that resolves to the CSRF token as a string if found, or null if not found or an error occurs.
 */
async function fetchCsrfToken() {
    try {
        // Make request to set the CSRF token cookie
        const response = await fetch('/api/csrf-token', {
            method: 'GET',
            credentials: 'include', // Include cookies
        });

        if (!response.ok) {
            console.error('Failed to fetch CSRF token:', response.statusText);
            return null;
        }

        // Read the CSRF token from the cookie
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrf_token') {
                return decodeURIComponent(value);
            }
        }

        console.error('CSRF token cookie not found');
        return null;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        return null;
    }
}

/**
 * Makes an HTTP API call with the specified method, URL, body, and options.
 * Handles state-changing requests (e.g., POST, PUT, DELETE) by including a CSRF token if available.
 * Implements token refresh logic for 401 Unauthorized errors, if enabled.
 *
 * @param {string} method - The HTTP method to use for the request (e.g., GET, POST, PUT, DELETE).
 * @param {string} url - The URL of the API endpoint to send the request to.
 * @param {Object|null} body - The request payload to be sent for methods that allow a body (e.g., POST, PUT).
 * @param {Object} [options={}] - Additional options for the API call.
 * @param {Object} [options.headers={}] - Custom headers to include in the request.
 * @param {boolean} [options.withCredentials=false] - Indicates whether to include credentials (e.g., cookies) in the request.
 * @param {boolean} [options.skipAuthRefresh=false] - Skips token refresh logic if set to true when encountering a 401 error.
 * @param {AbortSignal} [options.signal] - An optional AbortSignal to allow request cancellation.
 * @return {Promise<Object>} - A promise that resolves with the response data in JSON format, or an empty object for non-JSON responses.
 * @throws {ApiError} - If the response is not successful or a network error occurs.
 */
async function callApi(method, url, body, options = {}) {
    const { headers = {}, withCredentials = false, skipAuthRefresh = false, signal } = options;

    const mergedHeaders = {
        ...DEFAULT_HEADERS,
        ...headers,
    };

    // For state-changing methods, include CSRF token in headers
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
        // If we don't have a CSRF token yet, fetch one
        if (!csrfToken) {
            csrfToken = await fetchCsrfToken();
        }

        // Include the CSRF token in the headers
        if (csrfToken) {
            mergedHeaders['X-CSRF-Token'] = csrfToken;
        }
    }

    try {
        const requestOptions = {
            method,
            headers: mergedHeaders,
            credentials: withCredentials ? 'include' : 'same-origin', // Include cookies when withCredentials is true
            signal,
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
            return await response.json();
        } else {
            return {};
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
