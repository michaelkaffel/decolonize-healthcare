import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCourses = createAsyncThunk(
    'courses/fetchAll',
    async () => {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('Failed to fetch courses');
        return res.json();
    });


const coursesSlice = createSlice({
    name: 'courses',
    initialState: { items: [], status: 'idle', error: null },
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchCourses.pending, state => { state.status = 'loading'; })
            .addCase(fetchCourses.fulfilled, (state, action) => {
                state.items = action.payload;
                state.status = 'idle';
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                state.status = 'error';
                state.error = action.error.message;
            });
    },
});


export default coursesSlice.reducer;