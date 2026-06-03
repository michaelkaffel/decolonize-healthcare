import { Router } from 'express';
import { Storage } from '@google-cloud/storage';
import isAuthenticated from '../middleware/isAuthenticated.js';
import checkEnrollment from '../middleware/checkEnrollment.js';
import Course from '../models/Course.js';
import LessonProgress from '../models/LessonProgress.js';
import QuizAttempt from '../models/QuizAttempt.js';
import SurveyResponse from '../models/SurveyResponse.js';

const router = Router({ mergeParams: true });

let storage;
const getStorage = () => {
    if (!storage) storage = new Storage();
    return storage;
};

// Helper — find lesson within a course
const findLesson = (course, lessonId) => {
    for (const mod of course.modules) {
        const lesson = mod.lessons.id(lessonId);
        if (lesson) return lesson;
    }
    return null;
};

// GET /api/courses/:courseId/lessons
router.get(
    '/',
    isAuthenticated,
    checkEnrollment,
    async (req, res) => {
        try {
            const course = await Course.findById(req.params.courseId);

            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            const progress = await LessonProgress.find({
                user: req.user._id,
                course: course._id,
            });

            const progressMap = {};

            for (const p of progress) {
                progressMap[p.lesson.toString()] = {
                    completedAt: p.completedAt,
                    quizPassed: p.quizPassed,
                };
            }

            const modules = course.modules.map((mod) => ({
                id: mod._id,
                title: mod.title,
                order: mod.order,
                lessons: mod.lessons.map((lesson) => ({
                    id: lesson._id,
                    title: lesson.title,
                    order: lesson.order,
                    content: lesson.content,
                    videoSource: lesson.videoSource,
                    videoId: lesson.videoId,
                    hasQuiz: lesson.quiz?.questions?.length > 0,
                    pdfs: lesson.pdfs.map((pdf) => ({
                        id: pdf._id,
                        title: pdf.title,
                    })),
                    hasSurvey: lesson.survey?.questions?.length > 0,
                    survey: lesson.survey?.questions.length > 0 ? {
                        questions: lesson.survey.questions.map((q) => ({
                            id: q._id,
                            prompt: q.prompt,
                            type: q.type,
                            options: q.options,
                        }))
                    } : null,
                    progress: progressMap[lesson._id.toString()] || null,
                })),
            }));

            res.json({ course: { id: course._id, title: course.title, slug: course.slug }, modules });
        } catch (err) {
            console.error('Error fetching lessons:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// GET /api/courses/:courseId/progress — lesson completion count for dashboard
router.get(
    '/progress',
    isAuthenticated,
    checkEnrollment,
    async (req, res) => {
        try {
            const course = await Course.findById(req.params.courseId, 'modules.lessons._id');

            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            const total = course.modules.reduce(
                (sum, mod) => sum + mod.lessons.length, 0
            );

            const completed = await LessonProgress.countDocuments({
                user: req.user._id,
                course: course._id,
            });

            res.json({ completed, total })
        } catch (err) {
            console.error('GET /progress error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// GET /api/courses/:courseId/lessons/:lessonId — single lesson
router.get(
    '/:lessonId',
    isAuthenticated,
    checkEnrollment,
    async (req, res) => {
        try {
            const course = await Course.findById(req.params.courseId);

            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            const lesson = findLesson(course, req.params.lessonId);

            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            const progress = await LessonProgress.findOne({
                user: req.user._id,
                course: course._id,
                lesson: lesson._id,
            });

            res.json({
                id: lesson._id,
                title: lesson.title,
                order: lesson.order,
                content: lesson.content,
                videoSource: lesson.videoSource,
                videoId: lesson.videoId,
                hasQuiz: lesson.quiz?.questions?.length > 0,
                pdfs: lesson.pdfs.map((pdf) => ({
                    id: pdf._id,
                    title: pdf.title,
                })),
                survey: lesson.survey?.questions?.length > 0 ? {
                    questions: lesson.survey.questions.map((q) => ({
                        id: q._id,
                        prompt: q.prompt,
                        type: q.type,
                        options: q.options,
                    }))
                } : null,
                progress: progress
                    ? { completedAt: progress.completedAt, quizPassed: progress.quizPassed }
                    : null,
            });
        } catch (err) {
            console.error('Error fetching lesson:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// POST /api/courses/:courseId/lessons/:lessonId/quiz — submit quiz
router.post(
    '/:lessonId/quiz',
    isAuthenticated,
    checkEnrollment,
    async (req, res) => {
        try {
            // Fetch course WITH correctIndex
            const course = await Course.findById(req.params.courseId).select(
                '+modules.lessons.quiz.questions.correctIndex'
            );

            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            const lesson = findLesson(course, req.params.lessonId);

            if (!lesson || !lesson.quiz?.questions?.length) {
                return res.status(404).json({ message: 'Quiz not found' });
            }

            const { answers } = req.body;

            if (!Array.isArray(answers) || answers.length !== lesson.quiz.questions.length) {
                return res.status(400).json({
                    message: `Expected ${lesson.quiz.questions.length} answers`,
                });
            }

            // Grade quiz
            let correct = 0;
            const results = lesson.quiz.questions.map((q, i) => {
                const isCorrect = answers[i] === q.correctIndex;
                if (isCorrect) correct++;
                return { questionId: q._id, correct: isCorrect };
            });

            const score = Math.round((correct / lesson.quiz.questions.length) * 100);
            const passed = score >= 70;

            // Record attempt

            await QuizAttempt.create({
                user: req.user._id,
                lesson: lesson._id,
                score,
                passed,
            });

            // Update progress if passed
            if (passed) {
                await LessonProgress.findOneAndUpdate(
                    { user: req.user._id, course: course._id, lesson: lesson._id },
                    { completedAt: new Date(), quizPassed: true },
                    { upsert: true }
                );
            }

            res.json({ score, passed, results });
        } catch (err) {
            console.error('Quiz submission error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// POST /api/courses/:courseId/lessons/:lessonId/complete — mark lesson complete (no quiz)
router.post(
    '/:lessonId/complete',
    isAuthenticated,
    checkEnrollment,
    async (req, res) => {
        try {
            const course = await Course.findById(req.params.courseId);

            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            const lesson = findLesson(course, req.params.lessonId);

            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            // Dont' allow manual completion if lesson has a quiz
            if (lesson.quiz?.questions?.length > 0) {
                return res.status(400).json({ message: 'Complete the quiz to finish this lesson' });
            }

            const progress = await LessonProgress.findOneAndUpdate(
                { user: req.user._id, course: course._id, lesson: lesson._id },
                { completedAt: new Date(), quizPassed: false },
                { upsert: true, new: true }
            );

            res.json({ completedAt: progress.completedAt });
        } catch (err) {
            console.error('Lesson completed error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// POST /api/courses/:courseId/lessons/:lessonId/survey — submit survey
router.post(
    '/:lessonId/survey',
    isAuthenticated,
    checkEnrollment,
    async (req, res) => {
        try {
            const course = await Course.findById(req.params.courseId);

            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            const lesson = findLesson(course, req.params.lessonId);

            if (!lesson || !lesson.survey?.questions?.length) {
                return res.status(404).json({ message: 'Survey not found' });
            }

            const { answers } = req.body;

            if (!Array.isArray(answers) || answers.length !== lesson.survey.questions.length) {
                return res.status(400).json({
                    message: `Expected ${lesson.survey.questions.length} answers`,
                });
            }

            await SurveyResponse.create({
                user: req.user._id,
                course: course._id,
                lesson: lesson._id,
                answers: answers.map((a) => ({
                    questionId: a.questionId,
                    value: a.value,
                })),
            });

            await LessonProgress.findOneAndUpdate(
                { user: req.user._id, course: course._id, lesson: lesson._id },
                { completedAt: new Date(), quizPassed: false },
                { upsert: true }
            );

            res.json({ submittedAt: new Date() })
        } catch (err) {
            console.error('Survey submission error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
)

// GET /api/courses/:courseId/lessons/:lessonId/pdf/:pdfId — signed URL for PDF
router.get(
    '/:lessonId/pdf/:pdfId',
    isAuthenticated,
    checkEnrollment,
    async (req, res) => {
        try {
            // Fetch course with gcsPath
            const course = await Course.findById(req.params.courseId).select(
                '+modules.lessons.pdfs.gcsPath'
            );

            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            const lesson = findLesson(course, req.params.lessonId);

            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            const pdf = lesson.pdfs.id(req.params.pdfId);

            if (!pdf) {
                return res.status(404).json({ message: 'PDF not found' });
            }

            const [url] = await getStorage()
                .bucket(process.env.GCS_BUCKET_NAME)
                .file(pdf.gcsPath)
                .getSignedUrl({
                    version: 'v4',
                    action: 'read',
                    expires: Date.now() + 15 * 60 * 1000,
                });

            res.json({ url })
        } catch (err) {
            console.error('PDF signed URL error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

export default router;