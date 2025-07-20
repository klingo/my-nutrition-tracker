import { startServer } from './app.js';
import mongoose from 'mongoose';
import config from './config/app.config.js';

mongoose.set('strictQuery', true);
mongoose
    .connect(config.mongoUri, {})
    .then(() => {
        console.log('MongoDB connected successfully');
        // Start server only after DB connection is established
        startServer();
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
