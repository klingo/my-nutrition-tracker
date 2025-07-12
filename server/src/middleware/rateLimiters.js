import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints (login and register)
 * Allows 10 requests per 15 minutes
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: { message: 'Too many authentication attempts, please try again later' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Rate limiter for refresh endpoint
 * Allows 5 requests per 15 minutes
 */
export const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many refresh attempts, please try again later',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Rate limiter for status endpoint
 * Allows 30 requests per minute
 */
export const statusLimiter = rateLimit({
    windowMs: 60 * 1000, // 15 minutes
    max: 30, // 30 attempts per window
    message: { message: 'Too many requests, please try again later' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Rate limiter for mutation endpoints (POST, PUT, DELETE)
 * Allows 15 requests per minute
 */
export const mutationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15, // 15 requests per minute
    message: { message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for query endpoints (GET)
 * Allows 60 requests per minute
 */
export const queryLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: { message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
