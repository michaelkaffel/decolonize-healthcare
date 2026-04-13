import express from 'express';
import Enrollment from '../models/Enrollment.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            user: req.user._id,
            status: 'active',
        }).populate('course', 'title slug description thumbnail');

        res.json(enrollments);
    } catch (err) {
        console.error('GET /api/enrollments', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;