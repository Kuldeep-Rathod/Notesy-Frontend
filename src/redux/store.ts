import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { authAPI } from './api/authAPI';
import { boardsAPI } from './api/boardsAPI';
import { labelsAPI } from './api/labelsAPI';
import { notesAPI } from './api/notesAPI';
import { userAPI } from './api/userAPI';
import authReducer from './reducer/authReducer';
import gestureReducer from './reducer/gestureReducer';
import { noteInputReducer } from './reducer/noteInputReducer';

export const rootReducer = combineReducers({
    auth: authReducer,
    gesture: gestureReducer,
    [noteInputReducer.name]: noteInputReducer.reducer,
    [authAPI.reducerPath]: authAPI.reducer,
    [notesAPI.reducerPath]: notesAPI.reducer,
    [userAPI.reducerPath]: userAPI.reducer,
    [labelsAPI.reducerPath]: labelsAPI.reducer,
    [boardsAPI.reducerPath]: boardsAPI.reducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authAPI.middleware,
            notesAPI.middleware,
            userAPI.middleware,
            labelsAPI.middleware,
            boardsAPI.middleware
        ),
    devTools: process.env.NODE_ENV !== 'production',
});

// Infer the type of makeStore
export type AppStore = typeof store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
