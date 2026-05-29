import 'dotenv/config';
import connectDB from '../db.js';
import Course from '../models/Course.js';
import { courseData as meditationExploration } from './content/meditation-exploration.mjs';

// For multiple courses
// import { courseData as courseTwo } from './content/course-two.mjs';
// import { courseData as nervousSystemReset } from './content/nervous-system-reset.mjs';

await connectDB();

await Course.deleteMany();

await Course.insertMany([meditationExploration]);

// For multiple courses
// await Course.insertMany([meditationExploration, nervousSystemReset]);

console.log('Seeded 1 course.');
process.exit(0);