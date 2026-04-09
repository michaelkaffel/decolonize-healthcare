import Enrollment from '../models/Enrollment.js';

const checkEnrollment = async (req, res, next) => {
    try {
        const enrollment = await Enrollment.findOne({
            user: req.user._id,
            course: req.params.courseId,
            status: 'active',
        });

        if (!enrollment) {
            return res.status(403).json({ message: 'Not enrolled in this course'});
        }

        req.enrollment = enrollment;
        next();
    } catch (err) {
        console.error('Enrollment check failed:', err);
        res.status(500).json({ message: 'Server error'});
    }
};

export default checkEnrollment;