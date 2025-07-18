'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, googleProvider } from '@/lib/firebase';
import { axiosInstance } from '@/utils/axiosInstance';
import GuestGuard from '@/utils/guestGuard';
import axios from 'axios';
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithPopup,
    updateProfile,
} from 'firebase/auth';
import { ArrowRight, Mic } from 'lucide-react';
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
            const userData = {
                email: firebaseUser.email,
                name:
                    name ||
                    firebaseUser.displayName ||
                    firebaseUser.email.split('@')[0],
                photo: photo || firebaseUser.photoURL || null,
                firebaseUid: firebaseUser.uid,
            };

            const response = await axiosInstance.post(
                '/auth/register',
                userData
            );
            return response.data;
        } catch (error) {
            console.error('Error creating MongoDB user:', error);
            throw error;
        }
    };

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setFirebaseError('');

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );

            await updateProfile(userCredential.user, {
                displayName: data.name,
                photoURL: null,
            });

            // Send verification email
            await sendEmailVerification(userCredential.user, {
                url: `${window.location.origin}/verify-email`,
            });

            // Redirect to verify-email page
            router.push(
                `/verify-email?email=${encodeURIComponent(data.email)}`
            );
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
                await axiosInstance.get(`/auth/check?email=${email}`);
                router.push('/dashboard');
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    await createMongoUser(
                        userCredential.user,
                        userCredential.user.displayName || undefined,
                        userCredential.user.photoURL || undefined
                    );
                    router.push('/dashboard');
                } else {
                    throw err;
                }
            }
        } catch (error: any) {
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
        <GuestGuard>
            <div className='min-h-screen bg-slate-50 flex items-center justify-center p-6'>
                <div className='w-full max-w-md'>
                    <div className='flex justify-center mb-8'>
                        <Link href='/' className='flex items-center space-x-2'>
                            <div className='w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center'>
                                <Mic className='w-6 h-6 text-white' />
                            </div>
                            <span className='text-2xl font-bold text-slate-800'>
                                Notesy
                            </span>
                        </Link>
                    </div>

                    <div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-8'>
                        <div className='text-center mb-8'>
                            <h1 className='text-3xl font-bold text-slate-800 mb-2'>
                                Create your account
                            </h1>
                            <p className='text-slate-600'>
                                Get started with Notesy today
                            </p>
                        </div>

                        {firebaseError && (
                            <div className='bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm'>
                                {firebaseError}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className='space-y-4'
                        >
                            <div>
                                <Label
                                    htmlFor='name'
                                    className='block text-sm font-medium text-slate-700 mb-1'
                                >
                                    Name
                                </Label>
                                <Input
                                    id='name'
                                    type='text'
                                    placeholder='Your name'
                                    {...register('name', {
                                        required: 'Name is required',
                                    })}
                                    className={`w-full ${
                                        errors.name ? 'border-red-500' : ''
                                    }`}
                                />
                                {errors.name && (
                                    <p className='mt-1 text-sm text-red-600'>
                                        {errors.name.message as string}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label
                                    htmlFor='email'
                                    className='block text-sm font-medium text-slate-700 mb-1'
                                >
                                    Email
                                </Label>
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
                                    className={`w-full ${
                                        errors.email ? 'border-red-500' : ''
                                    }`}
                                />
                                {errors.email && (
                                    <p className='mt-1 text-sm text-red-600'>
                                        {errors.email.message as string}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label
                                    htmlFor='password'
                                    className='block text-sm font-medium text-slate-700 mb-1'
                                >
                                    Password
                                </Label>
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
                                    className={`w-full ${
                                        errors.password ? 'border-red-500' : ''
                                    }`}
                                />
                                {errors.password && (
                                    <p className='mt-1 text-sm text-red-600'>
                                        {errors.password.message as string}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label
                                    htmlFor='confirmPassword'
                                    className='block text-sm font-medium text-slate-700 mb-1'
                                >
                                    Confirm Password
                                </Label>
                                <Input
                                    id='confirmPassword'
                                    type='password'
                                    placeholder='••••••••'
                                    {...register('confirmPassword', {
                                        required:
                                            'Please confirm your password',
                                        validate: (value) =>
                                            value === watch('password') ||
                                            'Passwords do not match',
                                    })}
                                    className={`w-full ${
                                        errors.confirmPassword
                                            ? 'border-red-500'
                                            : ''
                                    }`}
                                />
                                {errors.confirmPassword && (
                                    <p className='mt-1 text-sm text-red-600'>
                                        {
                                            errors.confirmPassword
                                                .message as string
                                        }
                                    </p>
                                )}
                            </div>

                            <Button
                                type='submit'
                                className='w-full bg-indigo-600 hover:bg-indigo-700 py-3 px-4 border border-transparent rounded-full font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? 'Creating account...'
                                    : 'Create account'}
                                <ArrowRight className='w-4 h-4 ml-2' />
                            </Button>
                        </form>

                        <div className='mt-6'>
                            <div className='relative'>
                                <div className='absolute inset-0 flex items-center'>
                                    <div className='w-full border-t border-slate-300'></div>
                                </div>
                                <div className='relative flex justify-center text-sm'>
                                    <span className='px-2 bg-white text-slate-500'>
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className='mt-6 grid grid-cols-1 gap-3'>
                                <Button
                                    variant='outline'
                                    onClick={signInWithGoogle}
                                    disabled={isLoading}
                                    className='w-full py-3 px-4 border border-slate-300 rounded-full font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                >
                                    <GoogleIcon />
                                    <span className='ml-2'>
                                        Sign up with Google
                                    </span>
                                </Button>
                            </div>
                        </div>

                        <div className='mt-6 text-center text-sm text-slate-600'>
                            Already have an account?{' '}
                            <Link
                                href='/login'
                                className='font-medium text-indigo-600 hover:text-indigo-500'
                            >
                                Log in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </GuestGuard>
    );
}

const GoogleIcon = () => (
    <svg className='w-5 h-5' viewBox='0 0 24 24' width='20' height='20'>
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
