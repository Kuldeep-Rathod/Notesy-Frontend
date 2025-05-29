import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GestureState {
    hasUserGesture: boolean;
    showGesturePrompt: boolean;
}

const initialState: GestureState = {
    hasUserGesture: false,
    showGesturePrompt: true,
};

const gestureReducer = createSlice({
    name: 'gesture',
    initialState,
    reducers: {
        setUserGesture: (state, action: PayloadAction<boolean>) => {
            state.hasUserGesture = action.payload;
            if (action.payload) {
                state.showGesturePrompt = false;
            }
        },
        setShowGesturePrompt: (state, action: PayloadAction<boolean>) => {
            state.showGesturePrompt = action.payload;
        },
        activateGesture: (state) => {
            state.hasUserGesture = true;
            state.showGesturePrompt = false;
        },
        resetGesture: (state) => {
            state.hasUserGesture = false;
            state.showGesturePrompt = true;
        },
    },
});

export const {
    setUserGesture,
    setShowGesturePrompt,
    activateGesture,
    resetGesture,
} = gestureReducer.actions;

export default gestureReducer.reducer;
