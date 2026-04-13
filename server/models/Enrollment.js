import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
    {

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

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);