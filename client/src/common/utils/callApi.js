import ApiError from '@common/errors/ApiError';

async function callApi(url, method, body, headers = {}) {
    const defaultHeaders = { 'Content-Type': 'application/json' };
    const mergedHeaders = { ...defaultHeaders, ...headers };

    try {
        const response = await fetch(url, {
            method,
            headers: mergedHeaders,
            body: JSON.stringify(body),
        });
        console.log(response);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.message || `Request failed: ${response.statusText}`,
                response.status,
                response,
            );
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

export default callApi;
