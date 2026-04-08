import { Router } from 'express';
import Stripe from 'stripe';
import isAuthenticated from '../middleware/isAuthenticated.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

const router = Router();

let stripe;
const getStripe = () => {
    if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    return stripe;
};

router.post('/create-session', isAuthenticated, async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ message: 'courseId is required' });
        }

        const course = await Course.findById(courseId);

        if (!course || !course.published) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const existing = await Enrollment.findOne({
            user: req.user._id,
            course: course._id,
            status: 'active',
        });

        if (existing) {
            return res.status(400).json({ message: 'Already enrolled' });
        }

        const session = await getStripe().checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            customer_email: req.user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: course.price,
                        product_data: {
                            name: course.title,
                            description: course.description,
                        },
                    },
                    quantity: 1,
                }
            ],
            metadata: {
                userId: req.user._id.toString(),
                courseId: course._id.toString(),
            },
            success_url: `${process.env.CLIENT_URL}/dashboard?purchased=${course.slug}`,
            cancel_url: `${process.env.CLIENT_URL}/programs/${course.slug}`,
        });
        res.json({ url: session.url })
    } catch (err) {
        console.error('Checkout session error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;