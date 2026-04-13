import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchProgress = createAsyncThunk(
    'progress/fetchAll',
    async (courseId) => {
        const res = await fetch(`/api/courses/${courseId}/lessons/progress`, {
            credentials: 'include',
        });
        if (!res.ok) throw new Error ('Failed to fetch progress');
        const data = await res.json();
        return { courseId, ...data };
    }
);

const progressSlice = createSlice({
    name: 'progress',
    initialState: { byCourse: {}, status: 'idle', error: null },
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchProgress.pending, state => {state.status = 'loading'})
            .addCase(fetchProgress.fulfilled, (state, action) => {
                const { courseId, completed, total } = action.payload;
                state.byCourse[courseId] = {completed, total };
                state.status = 'idle';
            })
            .addCase(fetchProgress.rejected, (state, action) => {
                state.status = 'error';
                state.error = action.error.message;
            });
    },
});

export default progressSlice.reducer