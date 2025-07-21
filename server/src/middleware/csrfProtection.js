import crypto from 'crypto';

const csrfCookieName = 'csrf_token';
const csrfHeaderName = 'x-csrf-token';

/**
 * Generates a random CSRF (Cross-Site Request Forgery) token.
 *
 * This function uses cryptographic randomness to generate a secure,
 * unique token in hexadecimal format, which can be used to protect
 * against CSRF attacks in web applications.
 *
 * @returns {string} A 64-character long, securely generated random string in hexadecimal format.
 */
const generateCsrfToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Generates and provides a CSRF token to the client.
 *
 * This function generates a CSRF token and sets it in a cookie with specific options,
 * such as `httpOnly`, `secure`, `sameSite`, and `path`. It is designed to ensure CSRF protection
 * by facilitating secure token handling on the client side. The function sends a 204 No Content
 * response after setting the cookie.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
export const csrfTokenProvider = (req, res) => {
    // Generate a new CSRF token
    const csrfToken = generateCsrfToken();

    // Set the token in a cookie
    res.cookie(csrfCookieName, csrfToken, {
        httpOnly: false, // Allow JavaScript to read this cookie
        secure: true,
        sameSite: 'strict',
        path: '/',
    });

    // Send a 204 No Content response
    res.status(204).send();
};

/**
 * Middleware to validate CSRF tokens in requests.
 *
 * This function ensures that state-changing HTTP methods (e.g., POST, PUT, DELETE)
 * include valid CSRF tokens to help prevent cross-site request forgery attacks.
 *
 * Validation is performed by comparing the CSRF token provided in the request
 * cookies with the token sent in headers. If the tokens match, the request proceeds
 * to the next middleware or route handler. Otherwise, a 403 Forbidden response is sent.
 *
 * Requests with methods such as GET, HEAD, and OPTIONS are exempted from CSRF validation.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 */
export const validateCsrfToken = (req, res, next) => {
    // Skip validation for non-state-changing methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const cookieToken = req.cookies[csrfCookieName];
    const headerToken = req.headers[csrfHeaderName];

    if (cookieToken && headerToken && cookieToken === headerToken) {
        return next();
    }

    return res.status(403).json({ message: 'CSRF token invalid or missing' });
};
