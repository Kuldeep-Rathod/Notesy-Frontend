import { DbUser } from '@/types/reducer-types';
import { createApi } from '@reduxjs/toolkit/query/react';
import customBaseQuery from './customBaseQuery';

export const userAPI = createApi({
    reducerPath: 'userApi',
    baseQuery: customBaseQuery,
    endpoints: (builder) => ({
        getCurrentUser: builder.query<DbUser, void>({
            query: () => 'users/me',
        }),

        getAllUsers: builder.query<DbUser[], void>({
            query: () => 'users',
        }),

        updateUserProfile: builder.mutation<DbUser, FormData>({
            query: (formData) => ({
                url: 'users/profile',
                method: 'PUT',
                body: formData,
            }),
        }),
    }),
});

export const {
    useGetCurrentUserQuery,
    useGetAllUsersQuery,
    useUpdateUserProfileMutation,
} = userAPI;
