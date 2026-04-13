import express from 'express';
import passport from '../config/passport.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(200).json({ message: 'If that email is available, your account has been created'})
        }

        const user = new User({ name, email, username: email });
        await User.register(user, password);

        req.login(user, (err) => {
            if (err) return res.status(500).json({ message: 'Registration succeeded but login failed.'});
            return res.status(201).json({ id: user._id, name: user.name, email: user.email })
        });
    } catch (_err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+hash');
        if (!user) {
            return res.status(200).json({ message: 'Invalid email or password.' });
        };

        if (user.googleId && !user.hash) {
            return res.status(200).json({ message: 'This account uses Google login.' });
        };

        passport.authenticate('local', (err, authenticatedUser) => {
            if (err) return next(err);
            if (!authenticatedUser) {
                return res.status(200).json({message: 'Invalid email or password.' });
            }
            req.login(authenticatedUser, (loginErr) => {
                if (loginErr) return next(loginErr);
                return res.json({ id: authenticatedUser._id, name: authenticatedUser.name, email: authenticatedUser.email });
            });
        })(req, res, next);
    } catch (err) {
        next(err);
    }
});

router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.json({ message: 'Logged out.' });
    });
});

router.get('/me', (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });
    res.json({ id: req.user._id, name: req.user.name, email: req.user.email })
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
    (req, res) => {
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }
);

export default router;