import express from 'express';
import { Resend } from 'resend';

const router = express.Router();

let resend;

const getResend = () => {
    if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
    return resend;
};

router.post('/subscribe', async (req, res) => {
    const { email, firstName, lastName } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Valid email required.' });
    }

    try {
        const r = getResend();

        await r.contacts.create({
            audienceId: process.env.RESEND_AUDIENCE_ID,
            email,
            firstName: firstName?.trim() || undefined,
            lastName: lastName?.trim() || undefined,
            unsubscribed: false,
        });

        await r.emails.send({
            from: 'Decolonize Healthcare <onboarding@resend.dev>',
            to: email,
            subject: `You're in — welcome to Decolonize Healthcare`,
            html: `
                <p>Hi${firstName ? ` ${firstName.trim()}` : ''},</p>
                <p>Thanks for subscribing to Decolonize Healthcare. We'll be in touch with new articles, resources, and updates.</p>
                <p>In the meantime, explore our free content at <a href="https://decolonizehealthcare.com">decolonizehealthcare.com</a>.</p>
                <p>— The Decolonize Healthcare team</p>
            `
        });

        return res.status(200).json({ message: 'Subscribed.' });
    } catch (err) {
        if (err?.statusCode === 422) {
            return res.status(200).json({ message: 'Subscribed.' });
        }
        console.error('Newsletter subscribe error:', err);
        return res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

export default router;