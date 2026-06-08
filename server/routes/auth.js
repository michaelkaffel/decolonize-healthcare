import crypto from 'crypto';
import express from 'express';
import { Resend } from 'resend';
import passport from '../config/passport.js';
import User from '../models/User.js';

const router = express.Router();

let resendClient = null;
const getResend = () => {
    if (!resendClient) resendClient = new Resend(process.env.NEWSLETTER_API_KEY);
    return resendClient;
};

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(200).json({ message: 'If that email is available, your account has been created' })
        }

        const user = new User({ name, email, username: email });
        await User.register(user, password);

        req.login(user, (err) => {
            if (err) return res.status(500).json({ message: 'Registration succeeded but login failed.' });
            return res.status(201).json({ id: user.id, name: user.name, email: user.email })
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
                return res.status(200).json({ message: 'Invalid email or password.' });
            }
            req.login(authenticatedUser, (loginErr) => {
                if (loginErr) return next(loginErr);
                return res.json({ id: authenticatedUser.id, name: authenticatedUser.name, email: authenticatedUser.email });
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
    res.json({ id: req.user.id, name: req.user.name, email: req.user.email })
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
    (req, res) => {
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }
);

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const GENERIC = { message: 'If an account with that email exists, a reset link has been sent.' };

    try {
        const user = await User.findOne({ email }).select('+hash +resetToken +resetTokenExpiry');

        if (!user) return res.json(GENERIC)

        if (!user.hash)
            return res.status(200).json({ message: 'This account uses Google Sign-In. Please log in with Google instead.' });

        const plainToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

        user.resetToken = hashedToken;
        user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${plainToken}`;

        await getResend().emails.send({
            from: 'noreply@decolonizehealthcare.com',
            to: user.email,
            subject: 'Reset your password',
            html: `
                <p>Hi ${user.name},</p>
                <p>We received a request to reset the password for your Decolonize Healthcare account.</p>
                <p>
                    <a href="${resetUrl}" style="color:#c0392b;font-weight:bold">
                        Reset your password
                    </a>
                </p>
                <p>This link expires in <strong>1 hour</strong>.</p>
                <p>If you didn't request this, you can safely ignore this email — your password won't change.</p>
                <p>— Decolonize Healthcare</p>
            `,
        });

        res.json(GENERIC);
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password)
        return res.status(400).json({ message: 'Token and password are required.' });
    if (password.length < 8)
        return res.status(400).json({ message: 'Password must be at least 8 characters.' });

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpiry: { $gt: new Date() },
        }).select('+resetToken +resetTokenExpiry');

        if (!user)
            return res.status(400).json({ message: 'This reset link is invalid or has expired.' });

        await user.setPassword(password);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: 'Password updated successfully.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;