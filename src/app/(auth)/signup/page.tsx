'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, googleProvider } from '@/lib/firebase';
import '@/styles/app/_signup.scss';
import { axiosInstance } from '@/utils/axiosInstance';
import axios from 'axios';
import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    updateProfile,
} from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function Signup() {
    const router = useRouter();
    const [firebaseError, setFirebaseError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm();

    const createMongoUser = async (
        firebaseUser: any,
        name?: string,
        photo?: string | null
    ) => {
        try {
            // Debug logs
            console.log('Creating MongoDB User with:', {
                email: firebaseUser.email,
                name:
                    name ||
                    firebaseUser.displayName ||
                    firebaseUser.email.split('@')[0],
                photo: photo || firebaseUser.photoURL || null,
                firebaseUid: firebaseUser.uid,
            });

            const userData = {
                email: firebaseUser.email,
                name:
                    name ||
                    firebaseUser.displayName ||
                    firebaseUser.email.split('@')[0],
                photo: photo || firebaseUser.photoURL || null,
                firebaseUid: firebaseUser.uid,
            };

            console.log('Sending user data to server:', userData);

            const response = await axiosInstance.post(
                '/api/v1/auth/register',
                userData
            );
            console.log('Server response:', response.data);

            return response.data;
        } catch (error) {
            console.error('Error creating MongoDB user:', error);
            if (axios.isAxiosError(error)) {
                console.error('Server error response:', error.response?.data);
            }
            throw error;
        }
    };

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setFirebaseError('');

        try {
            // 1. Create Firebase auth user
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );

            // 2. Update Firebase profile with name
            await updateProfile(userCredential.user, {
                displayName: data.name,
                photoURL: null,
            });

            // 3. Create corresponding MongoDB user
            await createMongoUser(userCredential.user, data.name);

            router.push('/dashboard');
        } catch (error: any) {
            setFirebaseError(getFirebaseErrorMessage(error.code));
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setIsLoading(true);
        setFirebaseError('');

        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
            const email = userCredential.user.email;

            if (!email) throw new Error('Email not found in user credential');

            try {
                await axiosInstance.get(`/api/v1/auth/check?email=${email}`);
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    // For Google sign-in, explicitly pass the photo URL
                    const mongoUser = await createMongoUser(
                        userCredential.user,
                        userCredential.user.displayName || undefined,
                        userCredential.user.photoURL || undefined
                    );
                    console.log('Created MongoDB User:', mongoUser);
                } else {
                    throw err;
                }
            }

            await router.push('/dashboard');
        } catch (error: any) {
            console.error('Google Sign-in Error:', error);
            setFirebaseError(getFirebaseErrorMessage(error.code));
        } finally {
            setIsLoading(false);
        }
    };

    const getFirebaseErrorMessage = (code: string) => {
        switch (code) {
            case 'auth/email-already-in-use':
                return 'Email is already in use. Try logging in instead.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/popup-closed-by-user':
                return 'Sign in popup was closed before completing.';
            default:
                return 'An error occurred. Please try again.';
        }
    };

    return (
        <div className='signup-container'>
            <div className='signup-card'>
                <div className='signup-header'>
                    <h1>Create your account</h1>
                    <p>Get started with Notesy today</p>
                </div>

                {firebaseError && (
                    <div className='firebase-error'>
                        <p>{firebaseError}</p>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className='signup-form'
                >
                    <div className='form-group'>
                        <Label htmlFor='email'>Email</Label>
                        <Input
                            id='email'
                            type='email'
                            placeholder='your@email.com'
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                            className={errors.email ? 'input-error' : ''}
                        />
                        {errors.email && (
                            <span className='error-message'>
                                {errors.email.message as string}
                            </span>
                        )}
                    </div>

                    <div className='form-group'>
                        <Label htmlFor='password'>Password</Label>
                        <Input
                            id='password'
                            type='password'
                            placeholder='••••••••'
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message:
                                        'Password must be at least 6 characters',
                                },
                            })}
                            className={errors.password ? 'input-error' : ''}
                        />
                        {errors.password && (
                            <span className='error-message'>
                                {errors.password.message as string}
                            </span>
                        )}
                    </div>

                    <div className='form-group'>
                        <Label htmlFor='confirmPassword'>
                            Confirm Password
                        </Label>
                        <Input
                            id='confirmPassword'
                            type='password'
                            placeholder='••••••••'
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: (value) =>
                                    value === watch('password') ||
                                    'Passwords do not match',
                            })}
                            className={
                                errors.confirmPassword ? 'input-error' : ''
                            }
                        />
                        {errors.confirmPassword && (
                            <span className='error-message'>
                                {errors.confirmPassword.message as string}
                            </span>
                        )}
                    </div>

                    <Button
                        type='submit'
                        className='signup-button'
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating account...' : 'Create account'}
                    </Button>
                </form>

                <div className='signup-divider'>
                    <span>or</span>
                </div>

                <Button
                    variant='outline'
                    className='google-signup-button'
                    onClick={signInWithGoogle}
                    disabled={isLoading}
                >
                    <GoogleIcon />
                    Sign up with Google
                </Button>

                <div className='login-footer'>
                    <p>
                        Already have an account?{' '}
                        <Link
                            href='/login'
                            className='login-link'
                        >
                            Log in
                        </Link>
                    </p>
                </div>
            </div>

            <div className='signup-graphics'>
                <div className='graphic-circle'></div>
                <div className='graphic-blur'></div>
            </div>
        </div>
    );
}

const GoogleIcon = () => (
    <svg
        className='social-icon'
        viewBox='0 0 24 24'
        width='20'
        height='20'
    >
        <path
            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
            fill='#4285F4'
        />
        <path
            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            fill='#34A853'
        />
        <path
            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
            fill='#FBBC05'
        />
        <path
            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            fill='#EA4335'
        />
    </svg>
);
