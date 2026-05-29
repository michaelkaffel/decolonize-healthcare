import express from 'express';
import Enrollment from '../models/Enrollment.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import Course from '../models/Course.js'

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

router.post('/free', isAuthenticated, async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ message: 'courseId is required' });
        }

        const course = await Course.findById(courseId);

        if (!course || !course.published) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.price !== 0) {
            return res.status(400).json({ message: 'Course is not free'});
        }

        const existing = await Enrollment.findOne({
            user: req.user._id,
            course: courseId,
            status: 'active'
        });

        if (existing) {
            return res.status(400).json({ message: 'Already enrolled'});
        }

        await Enrollment.create({
            user: req.user._id,
            course: courseId,
            status: 'active',
            stripeSessionId: 'free',
        });

        res.status(201).json({ message: 'Enrolled' });
    } catch (err) {
        console.error('POST /api/enrollments/free', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;