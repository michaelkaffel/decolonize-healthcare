import mongoose from 'mongoose';

const toJSON = {
    transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    }
}

const quizQuestionSchema = new mongoose.Schema(
    {
        prompt: { type: String, required: true },
        options: {
            type: [String],
            required: true,
            validate: {
                validator: (arr) => arr.length >= 2,
                message: 'A question must have at least 2 options.',
            },
        },
        correctIndex: { type: Number, required: true, select: false },
    },
    { _id: true, toJSON }
);

const pdfSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        gcsPath: { type: String, required: true, select: false },
    },
    { _id: true, toJSON }
)

const lessonSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        order: { type: Number, required: true },
        content: { type: String, default: '' },
        videoSource: {
            type: String,
            enum: ['youtube', 'bunny', null],
            default: null,
        },
        videoId: { type: String, default: null },
        pdfs: [pdfSchema],
        quiz: {
            questions: [quizQuestionSchema],
        },
    },
    { _id: true, toJSON }
);

const moduleSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        order: { type: Number, required: true },
        lessons: [lessonSchema],
    },
    { _id: true, toJSON }
);

const courseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, default: '' },
        price: { type: Number, required: true },
        published: { type: Boolean, default: false },
        thumbnail: { type: String, default: '' },
        modules: [moduleSchema],
    },
    { timestamps: true, toJSON }
);

export default mongoose.model('Course', courseSchema)