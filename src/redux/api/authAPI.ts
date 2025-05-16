import { auth, googleProvider } from '@/lib/firebase';
import { axiosInstance } from '@/utils/axiosInstance';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
    signOut as firebaseSignOut,
    signInWithEmailAndPassword,
    signInWithPopup,
    User,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    deleteUser,
} from 'firebase/auth';

export const authAPI = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.SERVER_URL}/auth/`,
    }),
    endpoints: (builder) => ({
        // Firebase email/password login
        loginWithEmail: builder.mutation<
            User,
            { email: string; password: string }
        >({
            queryFn: async ({ email, password }) => {
                try {
                    const userCredential = await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                    //create this api in backend
                    const response = await fetch(
                        `http://localhost:3005/api/v1/auth/check?email=${userCredential.user.email}`
                    );
                    const user = await response.json();
                    return { data: user };
                } catch (error: any) {
                    return { error: error.message };
                }
            },
        }),

        // Google login
        loginWithGoogle: builder.mutation<User, void>({
            queryFn: async () => {
                try {
                    const userCredential = await signInWithPopup(
                        auth,
                        googleProvider
                    );
                    const email = userCredential.user.email;

                    const response = await axiosInstance.get(
                        `/api/v1/auth/check?email=${email}`
                    );
                    return { data: response.data };
                } catch (err: any) {
                    return {
                        error: {
                            status: err?.response?.status || 500,
                            data: err?.response?.data || err.message,
                        },
                    };
                }
            },
        }),

        // Logout
        logout: builder.mutation<void, void>({
            queryFn: async () => {
                try {
                    await firebaseSignOut(auth);
                    return { data: undefined };
                } catch (error: any) {
                    return { error: error.message };
                }
            },
        }),

        // Change password (requires reauthentication)
        changePassword: builder.mutation<
            void,
            { currentPassword: string; newPassword: string }
        >({
            queryFn: async ({ currentPassword, newPassword }) => {
                try {
                    const user = auth.currentUser;

                    if (!user) {
                        throw new Error('User not authenticated');
                    }

                    if (!user.email) {
                        throw new Error('User has no email for authentication');
                    }

                    // Create credential with current password
                    const credential = EmailAuthProvider.credential(
                        user.email,
                        currentPassword
                    );

                    // Re-authenticate the user
                    await reauthenticateWithCredential(user, credential);

                    // Update the password
                    await updatePassword(user, newPassword);

                    return { data: undefined };
                } catch (error: any) {
                    return {
                        error: error.message || 'Failed to change password',
                    };
                }
            },
        }),

        // Delete account (requires reauthentication)
        deleteAccount: builder.mutation<void, { password?: string }>({
            queryFn: async ({ password }) => {
                try {
                    const user = auth.currentUser;

                    if (!user) {
                        throw new Error('User not authenticated');
                    }

                    if (password && user.email) {
                        // Create credential with current password
                        const credential = EmailAuthProvider.credential(
                            user.email,
                            password
                        );

                        // Re-authenticate the user
                        await reauthenticateWithCredential(user, credential);
                        console.log('User reauthenticated');
                    }

                    const idToken = await user.getIdToken(true);

                    await axiosInstance.delete('/api/v1/users/me', {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    });

                    // Delete the user from Firebase
                    await deleteUser(user);

                    return { data: undefined };
                } catch (error: any) {
                    console.error('Account deletion failed:', error);
                    return {
                        error: error.message || 'Failed to delete account',
                    };
                }
            },
        }),
    }),
});

export const {
    useLoginWithEmailMutation,
    useLoginWithGoogleMutation,
    useLogoutMutation,
    useChangePasswordMutation,
    useDeleteAccountMutation,
} = authAPI;
