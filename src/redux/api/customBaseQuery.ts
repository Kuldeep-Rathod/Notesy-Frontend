import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const getAuthPromise = () => {
    return new Promise((resolve) => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
};

const customBaseQuery = fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/`,
    prepareHeaders: async (headers) => {
        await getAuthPromise();

        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            try {
                const token = await user.getIdToken(true);
                headers.set('Authorization', `Bearer ${token}`);
            } catch (error) {
                console.error('Failed to get ID token:', error);
            }
        }

        return headers;
    },
});

export default customBaseQuery;
