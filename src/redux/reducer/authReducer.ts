import { AppUser, AuthState } from '@/types/reducer-types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: AuthState = {
    user: null,
    loading: true,
    isAuthenticated: false,
};

export const authReducer = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<AppUser | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            state.loading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setUser, setLoading } = authReducer.actions;
export default authReducer.reducer;
