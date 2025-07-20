import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: process.env.PORT || 3001,
    clientUrl: process.env.CLIENT_URL || 'https://localhost:3000',
    env: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI,
    ssl: {
        certPath: process.env.SSL_CERT_PATH,
        keyPath: process.env.SSL_KEY_PATH,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    },
    cookies: {
        accessMaxAge: process.env.COOKIE_ACCESS_MAX_AGE || 15 * 60 * 1000,
        refreshMaxAge: process.env.COOKIE_REFRESH_MAX_AGE || 30 * 24 * 60 * 60 * 1000,
    },
    security: {
        saltRounds: parseInt(process.env.SALT_ROUNDS) || 10,
        pepper: process.env.PEPPER || '',
    },
};

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingEnvVars.length > 0) throw new Error(`Missing environment variables: ${missingEnvVars.join(', ')}`);

export default config;
