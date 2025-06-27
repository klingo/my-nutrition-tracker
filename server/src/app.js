import express from 'express';
import https from 'https';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import routes from './routes/index.js';
import 'dotenv/config';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
