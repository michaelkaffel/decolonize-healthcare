import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchEnrollments = createAsyncThunk(
    'enrollments/fetchAll',
    async () => {
        const res = await fetch('/api/enrollments', {
            credentials: 'include',
        });
        if (!res.ok) throw new Error ('Failed to fetch enrollments');
        return res.json();
    }
);

const enrollmentsSlice = createSlice({
    name: 'enrollments',
    initialState: { items: [], status: 'idle', error: null },
    reducers: {}, 
    extraReducers: builder => {
        builder
            .addCase(fetchEnrollments.pending, state => {state.status = 'loading';})
            .addCase(fetchEnrollments.fulfilled, (state, action) => {
                state.items = action.payload;
                state.status = 'idle';
            })
            .addCase(fetchEnrollments.rejected, (state, action) => {
                state.status = 'error';
                state.error = action.error.message;
            });
    },
});

export default enrollmentsSlice.reducer;