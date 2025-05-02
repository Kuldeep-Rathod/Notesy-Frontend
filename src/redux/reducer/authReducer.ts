import { AuthState } from '@/types/reducer-types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: AuthState = {
    user: null,
    loading: false,
    isAuthenticated: false,
};

export const authReducer = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setLoading } = authReducer.actions;
export default authReducer.reducer;
