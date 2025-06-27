import mongoose from 'mongoose';

mongoose.set('strictQuery', true);
mongoose
    .connect(process.env.MONGO_URI, {})
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
