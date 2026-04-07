import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import enrollmentsReducer from './enrollmentsSlice';
import progressReducer from './progressSlice';
import coursesReducer from './coursesSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        enrollments: enrollmentsReducer,
        progress: progressReducer,
        courses: coursesReducer
    },
});