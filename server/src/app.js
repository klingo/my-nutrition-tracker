import express from 'express';
import https from 'https';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import routes from './routes/index.js';
import config from './config/app.config.js';
import cookieParser from 'cookie-parser';
import securityHeaders from './middleware/securityHeaders.js';

const app = express();

// Middleware
app.use(
    cors({
        origin: config.clientUrl,
        credentials: true, // Allow cookies to be sent with requests
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type'],
    }),
);
app.use(express.json());
app.use(cookieParser());

// Security headers middleware
app.use(securityHeaders);

// API routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Load SSL certificate and key fron environment variables
const sslOptions = {
    cert: fs.readFileSync(path.resolve(config.ssl.certPath)),
    key: fs.readFileSync(path.resolve(config.ssl.keyPath)),
};

export function startServer() {
    return https.createServer(sslOptions, app).listen(config.port, () => {
        console.log(`API Server running on https://localhost:${config.port}`);
    });
}

export default app;
