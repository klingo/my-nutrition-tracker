import express from 'express';
import https from 'https';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import routes from './routes/index.js';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

const app = express();

// Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'https://localhost:3000',
        credentials: true, // Allow cookies to be sent with requests
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type'],
    }),
);
app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;

// Load SSL certificate and key fron environment variables
const sslOptions = {
    cert: fs.readFileSync(path.resolve(process.env.SSL_CERT_PATH)),
    key: fs.readFileSync(path.resolve(process.env.SSL_KEY_PATH)),
};

export function startServer() {
    return https.createServer(sslOptions, app).listen(PORT, () => {
        console.log(`API Server running on https://localhost:${PORT}`);
    });
}

export default app;
