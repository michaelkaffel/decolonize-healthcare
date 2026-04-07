import { createSlice } from '@reduxjs/toolkit';

const progressSlice = createSlice({
    name: 'progress',
    initialState: { byCourse: {}, status: 'idle' },
    reducers: {
        setProgress: (state, action) => {
            const { courseId, lessons } = action.payload;
            state.byCourse[courseId] = lessons;
        },
        clearProgress: (state) => { state.byCourse = {}; },
    },
});

export const { setProgress, clearProgress } = progressSlice.actions;

export default progressSlice.reducer