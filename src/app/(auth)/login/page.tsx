'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import '@/styles/app/_login.scss';
import {
    useLoginWithEmailMutation,
    useLoginWithGoogleMutation,
} from '@/redux/api/authAPI';

type LoginFormData = {
    email: string;
    password: string;
};

export default function Login() {
    const router = useRouter();
    const [firebaseError, setFirebaseError] = useState<string>(''); // To store Firebase errors
    const [loginWithEmail, { isLoading }] = useLoginWithEmailMutation();
    const [loginWithGoogle] = useLoginWithGoogleMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        try {
            const { email, password } = data;
            await loginWithEmail({ email, password }).unwrap();
            // Success - user will be in cache
            router.push('/dashboard');
        } catch (err: any) {
            // Handle error and set Firebase error message
            if (err?.code) {
                setFirebaseError(getFirebaseErrorMessage(err.code)); // Set error based on Firebase error code
            } else {
                setFirebaseError(
                    'An unknown error occurred. Please try again.'
                );
            }
        }
    };

    const signInWithGoogle = async () => {
        try {
            const result = await loginWithGoogle().unwrap();
            console.log('Logged in user:', result);
            // Navigate to dashboard or store user in state
            router.push('/dashboard');
        } catch (err: any) {
            // Handle error and set Firebase error message
            if (err?.code) {
                setFirebaseError(getFirebaseErrorMessage(err.code));
            } else {
                setFirebaseError(
                    'An unknown error occurred during Google login.'
                );
            }
        }
    };

    // Firebase error messages
    const getFirebaseErrorMessage = (code: string) => {
        switch (code) {
            case 'auth/email-already-in-use':
                return 'Email is already in use. Try logging in instead.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/popup-closed-by-user':
                return 'Sign-in popup was closed before completing.';
            case 'auth/user-not-found':
                return 'No account found with this email.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            default:
                return 'An error occurred. Please try again.';
        }
    };

    return (
        <div className='login-container'>
            <div className='login-card'>
                <div className='login-header'>
                    <h1>Welcome back</h1>
                    <p>Log in to your Notesy account</p>
                </div>

                {firebaseError && (
                    <div className='firebase-error'>
                        <p>{firebaseError}</p>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className='login-form'
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
                        <div className='password-label-container'>
                            <Label htmlFor='password'>Password</Label>
                            <Link
                                href='/forgot-password'
                                className='forgot-password'
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id='password'
                            type='password'
                            placeholder='••••••••'
                            {...register('password', {
                                required: 'Password is required',
                            })}
                            className={errors.password ? 'input-error' : ''}
                        />
                        {errors.password && (
                            <span className='error-message'>
                                {errors.password.message as string}
                            </span>
                        )}
                    </div>

                    <Button
                        type='submit'
                        className='login-button'
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Log in'}
                    </Button>
                </form>

                <div className='login-footer'>
                    <p>
                        Don&apos;t have an account?{' '}
                        <Link
                            href='/signup'
                            className='signup-link'
                        >
                            Sign up
                        </Link>
                    </p>
                </div>

                <div className='social-login'>
                    <p className='divider'>or continue with</p>
                    <div className='social-buttons'>
                        <Button
                            variant='outline'
                            className='social-button'
                            onClick={signInWithGoogle}
                            disabled={isLoading}
                        >
                            <GoogleIcon /> Google
                        </Button>
                        {/* You can add GitHub auth similarly if needed */}
                    </div>
                </div>
            </div>

            <div className='login-graphics'>
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
