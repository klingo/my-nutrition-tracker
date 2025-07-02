import ApiError from '@common/errors/ApiError';
import authService from '@common/services/AuthService.js';

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

/**
 * Makes an (un-)authenticated API call by including the JWT token in the headers (if present)
 * @param {string} url - The API endpoint URL
 * @param {string} method - The HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {object} body - The request body (for POST, PUT, etc.)
 * @param {object} headers - Additional headers to include
 * @returns {Promise<object>} - The API response
 */
async function callApi(url, method, body, headers = {}) {
    // Get the JWT token from the auth service
    const token = authService.getToken();
    const mergedHeaders = {
        ...DEFAULT_HEADERS,
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
        const requestOptions = {
            method,
            headers: mergedHeaders,
        };

        // Include body only for methods that typically allow it and if body is not empty
        if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body !== null && body !== undefined) {
            requestOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            throw await handleError(response);
        }
        return { data: await response.json() };
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
