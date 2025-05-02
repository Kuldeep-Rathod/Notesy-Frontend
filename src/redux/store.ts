import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { authAPI } from './api/authAPI';
import authReducer from './reducer/authReducer';

export const rootReducer = combineReducers({
    auth: authReducer,
    [authAPI.reducerPath]: authAPI.reducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authAPI.middleware),
    devTools: process.env.NODE_ENV !== 'production',
});

// Infer the type of makeStore
export type AppStore = typeof store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
