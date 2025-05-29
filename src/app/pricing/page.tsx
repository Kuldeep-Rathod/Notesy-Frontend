'use client';

import FAQ from '@/components/upgrade/FAQ';
import FeaturesHighlights from '@/components/upgrade/FeaturesHighlights';
import Feedback from '@/components/upgrade/Feedback';
import PricingPlans from '@/components/upgrade/PricingPlans';
import { axiosInstance } from '@/utils/axiosInstance';
import { plans } from '@/utils/PlansData';
import { loadStripe } from '@stripe/stripe-js';
import { getAuth } from 'firebase/auth';
import { Mic } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

const SubscriptionPage: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<string>('biannual');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePlanSelection = (planId: string) => {
        setSelectedPlan(planId);
        setError(null);
    };

    const handleSubscribe = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Find the selected plan
            const selectedPlanData = plans.find(
                (plan) => plan.id === selectedPlan
            );

            if (!selectedPlanData) {
                throw new Error('Selected plan not found');
            }

            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                throw new Error('User not authenticated');
            }

            const idToken = await user.getIdToken(true);

            const { data } = await axiosInstance.post(
                '/pay/create-checkout-session',
                {
                    planType: selectedPlanData.id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!data || !data.sessionId) {
                throw new Error('Invalid response from server');
            }

            // Redirect to Stripe checkout
            const stripe = await loadStripe(
                process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
            );

            if (!stripe) {
                throw new Error('Stripe failed to initialize');
            }

            const { error: stripeError } = await stripe.redirectToCheckout({
                sessionId: data.sessionId,
            });

            if (stripeError) {
                throw stripeError;
            }
        } catch (err: any) {
            console.error('Checkout error:', err);
            if (err.response?.status === 401) {
                setError('Your session has expired. Please log in again.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to initiate checkout. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen relative bg-gradient-to-b from-white to-gray-50'>
            <nav className='flex items-center justify-between p-6 max-w-7xl mx-auto'>
                <Link
                    href='/'
                    className='flex items-center space-x-2'
                >
                    <div className='w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center'>
                        <Mic className='w-6 h-6 text-white' />
                    </div>
                    <span className='text-2xl font-bold text-slate-800'>
                        Notesy
                    </span>
                </Link>

                <div className='hidden md:flex items-center space-x-8'>
                    <a
                        href='#features'
                        className='text-slate-600 hover:text-indigo-600 transition-colors'
                    >
                        Features
                    </a>
                    <a
                        href='#testimonials'
                        className='text-slate-600 hover:text-indigo-600 transition-colors'
                    >
                        Reviews
                    </a>
                    <Link
                        href='/pricing'
                        className='text-slate-600 hover:text-indigo-600 transition-colors'
                    >
                        Pricing
                    </Link>
                    <Link
                        href='/login'
                        className='bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition-colors'
                    >
                        Sign In
                    </Link>
                </div>
            </nav>
            {/* Header Section */}
            <div className='max-w-7xl mx-auto pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center'>
                <h1 className='text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl'>
                    Upgrade to Notesy Premium
                </h1>
                <p className='mt-5 max-w-xl mx-auto text-xl text-gray-500'>
                    Unlock the full power of voice-controlled note taking and
                    boost your productivity
                </p>
            </div>

            <FeaturesHighlights />

            <PricingPlans
                plans={plans}
                selectedPlan={selectedPlan}
                onPlanSelect={handlePlanSelection}
                onSubscribe={handleSubscribe}
                isLoading={isLoading}
                error={error}
            />

            <Feedback />
            <FAQ />

            {/* Footer */}
            <footer className='bg-white'>
                <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 md:flex md:items-center md:justify-between'>
                    <div className='mt-8 md:mt-0 md:order-1'>
                        <p className='text-center text-base text-gray-400'>
                            &copy; 2025 Notesy, Inc. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default SubscriptionPage;
