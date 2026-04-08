import mongoose from 'mongoose';

const lessonProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    completedAt: { type: Date, default: Date.now },
    quizPassed: { type: Boolean, default: false },
});

lessonProgressSchema.index({ user: 1, course: 1, lesson: 1 }, {unique: true });

export default mongoose.model('LessonProgress', lessonProgressSchema);