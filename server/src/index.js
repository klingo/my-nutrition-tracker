import 'dotenv/config';
import { startServer } from './app.js';
import mongoose from 'mongoose';

mongoose.set('strictQuery', true);
mongoose
    .connect(process.env.MONGO_URI, {})
    .then(() => {
        console.log('MongoDB connected successfully');
        // Start server only after DB connection is established
        startServer();
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
