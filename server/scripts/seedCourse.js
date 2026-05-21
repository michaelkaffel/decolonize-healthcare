import 'dotenv/config';
import connectDB from '../db.js';
import Course from '../models/Course.js';

await connectDB();

await Course.deleteMany();

await Course.insertMany([
    {
        title: 'Decolonizing Your Health Practice',
        slug: 'decolonizing-your-health-practice',
        description: 'Explore how colonial structures have shaped modern medicine and learn practical frameworks for reclaiming your health on your own terms.',
        price: 9900,
        published: true,
        thumbnail: 'https://picsum.photos/seed/course1/800/450',
        modules: [
            {
                title: 'Module 1 — Foundations',
                order: 1,
                lessons: [
                    {
                        title: 'Welcome & Course Overview',
                        order: 1,
                        content: '<p>Welcome to the course. Here is what we will cover.</p>',
                        videoSource: 'youtube',
                        videoId: 'dQw4w9WgXcQ',
                        pdfs: [],
                        quiz: { questions: [] },
                    },
                    {
                        title: 'The History of Colonial Medicine',
                        order: 2,
                        content: '<p>An overview of how colonial medicine developed.</p>',
                        videoSource: 'youtube',
                        videoId: 'dQw4w9WgXcQ',
                        pdfs: [
                            {
                                title: 'Supplementary Reading',
                                gcsPath: 'dev/placeholder.pdf',
                            },
                        ],
                        quiz: {
                            questions: [
                                {
                                    prompt: 'What is the primary focus of this lesson?',
                                    options: ['Nutrition', 'Colonial medicine history', 'Exercise science', 'Mental health'],
                                    correctIndex: 1,
                                },
                                {
                                    prompt: 'Which of the following best describes decolonizing healthcare?',
                                    options: [
                                        'Avoiding all modern medicine',
                                        'Critiquing and rebuilding health frameworks',
                                        'Returning to pre-industrial farming',
                                        'Eliminating all pharmaceutical drugs',
                                    ],
                                    correctIndex: 1,
                                },
                            ],
                        },
                    },
                ],
            },
            {
                title: 'Module 2 — Practical Tools',
                order: 2,
                lessons: [
                    {
                        title: 'Building Your Personal Health Framework',
                        order: 1,
                        content: '<p>In this lesson we build your personal framework.</p>',
                        videoSource: 'youtube',
                        videoId: 'dQw4w9WgXcQ',
                        pdfs: [],
                        quiz: { questions: [] },
                    },
                ],
            },
        ],
    },
    {
        title: 'Nervous System Reset',
        slug: 'nervous-system-reset',
        description: 'A practical course for understanding and regulating your nervous system using somatic, breathwork, and movement-based tools rooted in lived experience.',
        price: 7900,
        published: true,
        thumbnail: 'https://picsum.photos/seed/course2/800/450',
        modules: [
            {
                title: 'Module 1 — Understanding Your Nervous System',
                order: 1,
                lessons: [
                    {
                        title: 'Introduction to the Nervous System',
                        order: 1,
                        content: '<p>An introduction to how the nervous system works.</p>',
                        videoSource: 'youtube',
                        videoId: 'dQw4w9WgXcQ',
                        pdfs: [],
                        quiz: { questions: [] },
                    },
                    {
                        title: 'Fight, Flight, Freeze & Fawn',
                        order: 2,
                        content: '<p>Understanding stress responses and how they show up.</p>',
                        videoSource: 'youtube',
                        videoId: 'dQw4w9WgXcQ',
                        pdfs: [],
                        quiz: {
                            questions: [
                                {
                                    prompt: 'Which of the following is a stress response?',
                                    options: ['Digest', 'Freeze', 'Sleep', 'Grow'],
                                    correctIndex: 1,
                                },
                            ],
                        },
                    },
                ],
            },
            {
                title: 'Module 2 — Regulation Practices',
                order: 2,
                lessons: [
                    {
                        title: 'Breathwork for Regulation',
                        order: 1,
                        content: '<p>Practical breathwork techniques for nervous system regulation.</p>',
                        videoSource: 'youtube',
                        videoId: 'dQw4w9WgXcQ',
                        pdfs: [],
                        quiz: { questions: [] },
                    },
                    {
                        title: 'Somatic Movement Basics',
                        order: 2,
                        content: '<p>An introduction to somatic movement practices.</p>',
                        videoSource: 'youtube',
                        videoId: 'dQw4w9WgXcQ',
                        pdfs: [],
                        quiz: { questions: [] },
                    },
                ],
            },
        ],
    },
]);

console.log('Seeded 2 courses.');
process.exit(0);