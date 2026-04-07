import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const start = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Mongo connection failed', err);
        process.exit(1);
    }
};

start();



