import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchSession = createAsyncThunk(
    'user/fetchSession',
    async () => {
        try {
            const res = await fetch('/api/auth/me', {
                credentials: 'include'
            })
            if (!res.ok) return null;
            return res.json();
        } catch {
            return null;
        }
    }
);

export const logout = createAsyncThunk(
    'user/logout',
    async () => {
        const res = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        if (!res.ok) throw new Error('Logout failed')
    }
)

const userSlice = createSlice({
    name: 'user',
    initialState: { data: null, status: 'idle', error: null },
    reducers: {
        setUser: (state, action) => {state.data = action.payload },
        clearUser: (state) => { state.data = null },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchSession.pending, (state) => { 
                state.status = 'loading';
                state.error = null 
            })
            .addCase(fetchSession.fulfilled, (state, action) => {
                state.data = action.payload;
                state.status = 'idle';
                state.error = null
            })
            .addCase(logout.pending, (state) => {
                state.status = 'loading';
                state.error = null
            })
            .addCase(logout.fulfilled, (state) => {
                state.data = null;
                state.error = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.status = 'error';
                state.error = action.error.message;
            })
    }
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;