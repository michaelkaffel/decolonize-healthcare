import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
    {
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
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

quizAttemptSchema.index({ user: 1, lesson: 1 });

export default mongoose.model('QuizAttempt', quizAttemptSchema);