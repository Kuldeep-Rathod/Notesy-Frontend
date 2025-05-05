import { auth, googleProvider } from '@/lib/firebase';
import { axiosInstance } from '@/utils/axiosInstance';
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

        // Check auth state and get ID token
        // checkAuthState: builder.query<User, void>({
        //     queryFn: async () => {
        //         try {
        //             return new Promise((resolve) => {
        //                 const unsubscribe = auth.onAuthStateChanged(
        //                     async (firebaseUser) => {
        //                         if (firebaseUser) {
        //                             try {
        //                                 const idToken =
        //                                     await firebaseUser.getIdToken(); // ✅ Get the ID token

        //                                 // Pass the token to your backend for verification (or verify locally if needed)
        //                                 const response =
        //                                     await axiosInstance.get(
        //                                         '/api/v1/auth/verify',
        //                                         {
        //                                             headers: {
        //                                                 Authorization: `Bearer ${idToken}`, // ✅ Send as Bearer token
        //                                             },
        //                                         }
        //                                     );

        //                                 const user = response.data;
        //                                 resolve({ data: user });
        //                             } catch (err: any) {
        //                                 resolve({ error: err.message });
        //                             }
        //                         } else {
        //                             resolve({ error: 'Not authenticated' });
        //                         }

        //                         unsubscribe();
        //                     }
        //                 );
        //             });
        //         } catch (error: any) {
        //             return { error: error.message };
        //         }
        //     },
        // }),
    }),
});

export const {
    useLoginWithEmailMutation,
    useLoginWithGoogleMutation,
    useLogoutMutation,
    // useCheckAuthStateQuery,
} = authAPI;
