import express from 'express';
import cors from 'cors';
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

export default app;
