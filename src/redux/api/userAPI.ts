import { createApi } from '@reduxjs/toolkit/query/react';
import customBaseQuery from './customBaseQuery';
import { DbUser } from '@/types/reducer-types';

export const userAPI = createApi({
    reducerPath: 'userApi',
    baseQuery: customBaseQuery,
    endpoints: (builder) => ({
        getCurrentUser: builder.query<DbUser, void>({
            query: () => 'user/me',
        }),
    }),
});

export const { useGetCurrentUserQuery } = userAPI;
