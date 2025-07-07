class ApiError extends Error {
    constructor(message, status, response) {
        super(message);
        this.name = 'ApiError';
        this.message = message;
        this.status = status;
        this.response = response;
    }
}

export default ApiError;
