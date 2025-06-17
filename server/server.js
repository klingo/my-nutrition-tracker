import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import routes from './routes.js';
import 'dotenv/config';

const app = express();

app.use(express.json());
app.use('/api', routes);
app.use(express.static(path.join(process.cwd(), 'dist')));

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

app.use((req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));