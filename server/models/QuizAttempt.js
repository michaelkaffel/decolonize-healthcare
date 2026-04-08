import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    score: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    attemptedAt: { type: Date, default: Date.now },
});

quizAttemptSchema.index({ user: 1, lesson: 1 });

export default mongoose.model('QuizAttempt', quizAttemptSchema);