import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const answerSchema = new Schema(
    {
        questionId: { type: Schema.Types.ObjectId, required: true },
        value: { type: String, required: true },
    },
    {
        _id: false,
        toJSON: {
            transform(_doc, ret) {
                ret.id = ret._id?.toString();
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

const surveyResponseSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        lesson: { type: Schema.Types.ObjectId, required: true },
        answers: { type: [answerSchema], required: true },
        submittedAt: { type: Date, default: Date.now },
    },
    {
        toJSON: {
            transform(_doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

surveyResponseSchema.index({ user: 1, lesson: 1 });

export default model('SurveyResponse', surveyResponseSchema);