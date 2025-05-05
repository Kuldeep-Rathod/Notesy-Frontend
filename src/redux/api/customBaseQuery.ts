// services/customBaseQuery.ts
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuth } from 'firebase/auth';

const customBaseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:3005/api/v1/',
    prepareHeaders: async (headers) => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const token = await user.getIdToken();
            headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
    },
});

export default customBaseQuery;
