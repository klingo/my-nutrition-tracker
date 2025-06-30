import ApiError from '@common/errors/ApiError';

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

async function callApi(url, method, body, headers = {}) {
    const mergedHeaders = { ...DEFAULT_HEADERS, ...headers };

    try {
        const response = await fetch(url, {
            method,
            headers: mergedHeaders,
            body: JSON.stringify(body),
        });

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
