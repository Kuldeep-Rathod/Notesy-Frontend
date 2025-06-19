'use client';

import { Button } from '@/components/ui/button';
import { createMongoUser } from '@/lib/createMongoUser';
import { auth } from '@/lib/firebase';
import {
    onAuthStateChanged,
    reload,
    sendEmailVerification,
} from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifyEmailPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setError('No user found. Please sign in again.');
                setIsLoading(false);
                return;
            }

            if (email && user.email !== email) {
                setError('Email does not match the logged in user.');
                setIsLoading(false);
                return;
            }

            // Check if email is verified
            if (user.emailVerified) {
                setIsVerified(true);
                try {
                    // Create MongoDB user
                    await createMongoUser(user);
                    router.push('/dashboard');
                } catch (err) {
                    setError(
                        'Failed to create user account. Please try again.'
                    );
                    console.error(err);
                }
            } else {
                // If not verified, reload the user to check if they verified since page load
                await reload(user);
                if (user.emailVerified) {
                    setIsVerified(true);
                    try {
                        await createMongoUser(user);
                        router.push('/dashboard');
                    } catch (err) {
                        setError(
                            'Failed to create user account. Please try again.'
                        );
                        console.error(err);
                    }
                } else {
                    setIsVerified(false);
                }
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [email, router]);

    const handleResendEmail = async () => {
        if (!auth.currentUser) return;
        setIsLoading(true);
        try {
            await sendEmailVerification(auth.currentUser, {
                url: `${
                    window.location.origin
                }/verify-email?email=${encodeURIComponent(
                    auth.currentUser.email || ''
                )}`,
            });
            alert('Verification email resent!');
        } catch (error) {
            setError('Failed to resend verification email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-slate-50 flex items-center justify-center p-6'>
            <div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md w-full'>
                <div className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-slate-800 mb-2'>
                        Verify Your Email
                    </h1>
                    <p className='text-slate-600'>
                        {email
                            ? `A verification link has been sent to ${email}`
                            : 'Please check your email for a verification link'}
                    </p>
                </div>

                {isLoading ? (
                    <div className='text-center'>
                        Checking verification status...
                    </div>
                ) : error ? (
                    <div className='bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm'>
                        {error}
                    </div>
                ) : !isVerified ? (
                    <div className='space-y-4'>
                        <p>Please click the verification link in your email.</p>
                        <Button
                            onClick={handleResendEmail}
                            disabled={isLoading}
                            className='w-full'
                        >
                            Resend Verification Email
                        </Button>
                    </div>
                ) : (
                    <div className='text-center'>
                        <p>Email verified successfully! Redirecting...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
