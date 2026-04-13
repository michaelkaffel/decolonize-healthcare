import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchProgress = createAsyncThunk(
    'progress/fetchAll',
    async () => {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error ('Failed to fetch progress')
            return res.json()
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
                state.byCourse = action.payload;
                state.status = 'idle';
            })
            .addCase(fetchProgress.rejected, (state, action) => {
                state.status = 'error';
                state.error = action.error.message;
            });
    },
});

export default progressSlice.reducer