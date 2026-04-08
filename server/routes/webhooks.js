import { Router } from 'express';
import Stripe from 'stripe';
import Enrollment from '../models/Enrollment.js';

const router = Router();

let stripe;
const getStripe = () => {
    if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    return stripe;
};

router.post('/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = getStripe().webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ message: 'Invalid signature' });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { userId, courseId } = session.metadata;

        try {
            await Enrollment.findOneAndUpdate(
                { user: userId, course: courseId },
                {
                    user: userId,
                    course: courseId,
                    stripeSessionId: session.id,
                    status: 'active',
                    purchasedAt: new Date(),
                },
                { upsert: true, new: true }
            );
            console.log(`Enrollment created: user=${userId}, course=${courseId}`);
        } catch (err) {
            console.error('Enrollment created failed:', err);
            return res.status(500).json({ message: 'Enrollment failed' });
        }
    }

    res.json({ received: true });
});

export default router;