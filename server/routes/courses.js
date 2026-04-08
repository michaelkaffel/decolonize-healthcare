import { Router } from 'express';
import Course from '../models/Course.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find(
            { published: true },
            'title slug description price thumbnail'
        );
        res.json(courses);
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const course = await Course.findOne(
            { slug: req.params.slug, published: true },
            'title slug description price thumbnail modules.title modules.order modules.lessons.title modules.lessons.order'
        );

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (err) {
        console.error('Error fetching course:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
