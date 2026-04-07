import { createSlice } from '@reduxjs/toolkit';

const enrollmentsSlice = createSlice({
    name: 'enrollments',
    initialState: { items: [], status: 'idle' },
    reducers: {
        setEnrollments: (state, action) => { state.items = action.payload; },
        clearEnrollments: (state) => { state.items = []; },
    }, 
});

export const { setEnrollments, clearEnrollments } = enrollmentsSlice.actions;

export default enrollmentsSlice.reducer;