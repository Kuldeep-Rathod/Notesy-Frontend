import { auth, googleProvider } from '@/lib/firebase';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    User,
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
                    const uid = userCredential.user.uid;
                    // Call your backend API to get user data

                    //create this api in backend
                    const response = await fetch(`/user/${uid}`);
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
                    const uid = userCredential.user.uid;
                    const response = await fetch(`/user/${uid}`);
                    const user = await response.json();
                    return { data: user };
                } catch (error: any) {
                    return { error: error.message };
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

        // Check auth state
        checkAuthState: builder.query<User, void>({
            queryFn: async () => {
                try {
                    return new Promise((resolve) => {
                        const unsubscribe = auth.onAuthStateChanged(
                            async (firebaseUser) => {
                                if (firebaseUser) {
                                    const response = await fetch(
                                        `/user/${firebaseUser.uid}`
                                    );
                                    const user = await response.json();
                                    resolve({ data: user });
                                } else {
                                    resolve({ error: 'Not authenticated' });
                                }
                                unsubscribe();
                            }
                        );
                    });
                } catch (error: any) {
                    return { error: error.message };
                }
            },
        }),
    }),
});

export const {
    useLoginWithEmailMutation,
    useLoginWithGoogleMutation,
    useLogoutMutation,
    useCheckAuthStateQuery,
} = authAPI;
