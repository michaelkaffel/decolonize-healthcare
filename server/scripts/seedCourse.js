import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../db.js';
import Course from '../models/Course.js';

const devCourse = {
  title: 'Decolonizing Your Health Practice',
  slug: 'decolonizing-your-health-practice',
  description:
    'A foundational course exploring how colonial frameworks shape modern healthcare and how practitioners can build more equitable approaches.',
  price: 9900,
  published: true,
  thumbnail: '',
  modules: [
    {
      title: 'Module 1 — Foundations',
      order: 1,
      lessons: [
        {
          title: 'Welcome and Course Overview',
          order: 1,
          content:
            '<p>Welcome to the course. In this lesson we cover what you will learn and how to navigate the material.</p>',
          videoSource: 'youtube',
          videoId: 'dQw4w9WgXcQ',
          pdfs: [
            {
              title: 'Course Syllabus',
              gcsPath: 'courses/decolonizing/pdfs/syllabus.pdf',
            },
          ],
          quiz: { questions: [] },
        },
        {
          title: 'Historical Context',
          order: 2,
          content:
            '<p>This lesson examines the historical roots of colonial influence in healthcare systems.</p>',
          videoSource: null,
          videoId: null,
          pdfs: [],
          quiz: {
            questions: [
              {
                prompt:
                  'Which of the following best describes a colonial framework in healthcare?',
                options: [
                  'A system that centers indigenous healing traditions',
                  'A system that imposes one cultural model as universal',
                  'A system that adapts to local community needs',
                  'A system that prioritizes preventive care',
                ],
                correctIndex: 1,
              },
              {
                prompt:
                  'Why is historical context important for modern practitioners?',
                options: [
                  'It is not — only current evidence matters',
                  'It helps identify inherited biases in standard practices',
                  'It replaces the need for clinical training',
                ],
                correctIndex: 1,
              },
            ],
          },
        },
      ],
    },
    {
      title: 'Module 2 — Practice',
      order: 2,
      lessons: [
        {
          title: 'Reframing Assessment',
          order: 1,
          content:
            '<p>Practical strategies for making clinical assessments more culturally responsive.</p>',
          videoSource: 'youtube',
          videoId: 'dQw4w9WgXcQ',
          pdfs: [
            {
              title: 'Assessment Worksheet',
              gcsPath: 'courses/decolonizing/pdfs/assessment-worksheet.pdf',
            },
          ],
          quiz: { questions: [] },
        },
      ],
    },
  ],
};

async function seed() {
  try {
    await connectDB();
    await Course.deleteMany({});
    const course = await Course.create(devCourse);
    console.log(`Seeded course: ${course.title} (${course._id})`);
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();