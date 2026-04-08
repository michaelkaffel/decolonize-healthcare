import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
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
    purchasedAt: { type: Date, default: Date.now },
    stripeSessionId: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'refunded'],
        default: 'active',
    },
});

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);