import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { authAPI } from './api/authAPI';
import { notesAPI } from './api/notesAPI';
import authReducer from './reducer/authReducer';
import { userAPI } from './api/userAPI';

export const rootReducer = combineReducers({
    auth: authReducer,
    [authAPI.reducerPath]: authAPI.reducer,
    [notesAPI.reducerPath]: notesAPI.reducer,
    [userAPI.reducerPath]: userAPI.reducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authAPI.middleware,
            notesAPI.middleware,
            userAPI.middleware
        ),
    devTools: process.env.NODE_ENV !== 'production',
});

// Infer the type of makeStore
export type AppStore = typeof store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
