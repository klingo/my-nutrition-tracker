const securityHeaders = (req, res, next) => {
    // Prevents XSS by controlling which resources can be loaded
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    // Prevents MIME-type sniffing; forces browser to use declared content type
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Protects against clickjacking; prevents from being embedded in iframes
    res.setHeader('X-Frame-Options', 'DENY');
    // Enables XSS filtering in older browsers; stops the page from loading when XSS is detected
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Forces HTTPS; protects against SSL stripping attacks
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    // Controls how much referrer information is included in the request
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
};

export default securityHeaders;
