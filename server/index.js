import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from './config/passport.js';
import { configurePassport } from './config/passport.js';
import connectDB from './db.js';
import authRouter from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import checkoutRoutes from './routes/checkout.js';
import webhookRoutes from './routes/webhooks.js';
import lessonRoutes from './routes/lessons.js';
import enrollmentRoutes from './routes/enrollments.js';

configurePassport();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRouter);
app.use('/api/courses', courseRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/courses/:courseId/lessons', lessonRoutes);

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



