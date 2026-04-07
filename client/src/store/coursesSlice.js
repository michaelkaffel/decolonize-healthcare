import { createSlice } from '@reduxjs/toolkit';

const coursesSlice = createSlice({
    name: 'courses',
    initialState: { items: [], staus: 'idle' },
    reducers: {
        setCourses: (state, action) => { state.items = action.payload; },
    },
});

export const { setCourses } = coursesSlice.actions;

export default coursesSlice.reducer;