'use client';

// pages/subscription.tsx
import React, { useState } from 'react';
import { Check } from 'lucide-react';

// Define subscription plan types
interface Plan {
    id: string;
    name: string;
    price: number;
    duration: string;
    description: string;
    features: string[];
    popular?: boolean;
    savePercent?: number;
}

const SubscriptionPage: React.FC = () => {
    // Define all subscription plans
    const plans: Plan[] = [
        {
            id: 'monthly',
            name: 'Monthly',
            price: 9.99,
            duration: 'month',
            description: 'Perfect for trying out our premium features',
            features: [
                'Voice-controlled note creation',
                'Unlimited notes storage',
                'Cross-device synchronization',
                'Voice commands customization',
                '5GB cloud storage',
            ],
        },
        {
            id: 'quarterly',
            name: 'Quarterly',
            price: 24.99,
            duration: '3 months',
            description: 'Our most flexible premium option',
            features: [
                'Voice-controlled note creation',
                'Unlimited notes storage',
                'Cross-device synchronization',
                'Voice commands customization',
                '15GB cloud storage',
                'Priority customer support',
            ],
            savePercent: 17,
        },
        {
            id: 'biannual',
            name: '6 Months',
            price: 44.99,
            duration: '6 months',
            description: 'Great value for committed users',
            features: [
                'Voice-controlled note creation',
                'Unlimited notes storage',
                'Cross-device synchronization',
                'Voice commands customization',
                '25GB cloud storage',
                'Priority customer support',
                'Advanced analytics',
            ],
            popular: true,
            savePercent: 25,
        },
        {
            id: 'annual',
            name: 'Annual',
            price: 79.99,
            duration: 'year',
            description: 'Best value for our loyal users',
            features: [
                'Voice-controlled note creation',
                'Unlimited notes storage',
                'Cross-device synchronization',
                'Voice commands customization',
                '50GB cloud storage',
                'Premium customer support',
                'Advanced analytics',
                'Early access to new features',
            ],
            savePercent: 33,
        },
    ];

    const [selectedPlan, setSelectedPlan] = useState<string>('biannual');

    const handlePlanSelection = (planId: string) => {
        setSelectedPlan(planId);
    };

    const handleSubscribe = () => {
        // This would be replaced with your actual payment processing logic
        console.log(`Subscribing to plan: ${selectedPlan}`);
        // Integrate with your payment gateway here
    };

    return (
        <div className='min-h-screen relative bg-gradient-to-b from-white to-gray-50'>
            {/* Navigation */}
            {/* <nav className='bg-white shadow-sm'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex justify-between h-16'>
                        <div className='flex items-center'>
                            <span className='text-xl font-bold text-indigo-600'>
                                VoiceNotes
                            </span>
                        </div>
                        <div className='flex items-center'>
                            <button className='ml-4 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100'>
                                Sign In
                            </button>
                            <button className='ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700'>
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </nav> */}

            {/* Header Section */}
            <div className='max-w-7xl mx-auto pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center'>
                <h1 className='text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl'>
                    Upgrade to VoiceNotes Premium
                </h1>
                <p className='mt-5 max-w-xl mx-auto text-xl text-gray-500'>
                    Unlock the full power of voice-controlled note taking
                    and boost your productivity
                </p>
            </div>

            {/* Features Highlights */}
            <div className='max-w-7xl mx-auto pb-16 px-4 sm:px-6 lg:px-8'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    <div className='bg-white rounded-lg shadow-md p-6 flex flex-col items-center'>
                        <div className='h-12 w-12 rounded-md flex items-center justify-center bg-indigo-100 text-indigo-600 mb-4'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                                className='h-6 w-6'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z'
                                />
                            </svg>
                        </div>
                        <h3 className='text-lg font-medium text-gray-900'>
                            Voice Control
                        </h3>
                        <p className='mt-2 text-sm text-gray-500 text-center'>
                            Create and manage notes using only your voice
                        </p>
                    </div>

                    <div className='bg-white rounded-lg shadow-md p-6 flex flex-col items-center'>
                        <div className='h-12 w-12 rounded-md flex items-center justify-center bg-indigo-100 text-indigo-600 mb-4'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                                className='h-6 w-6'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z'
                                />
                            </svg>
                        </div>
                        <h3 className='text-lg font-medium text-gray-900'>
                            Cloud Sync
                        </h3>
                        <p className='mt-2 text-sm text-gray-500 text-center'>
                            Access your notes from any device, anywhere
                        </p>
                    </div>

                    <div className='bg-white rounded-lg shadow-md p-6 flex flex-col items-center'>
                        <div className='h-12 w-12 rounded-md flex items-center justify-center bg-indigo-100 text-indigo-600 mb-4'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                                className='h-6 w-6'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
                                />
                            </svg>
                        </div>
                        <h3 className='text-lg font-medium text-gray-900'>
                            Custom Commands
                        </h3>
                        <p className='mt-2 text-sm text-gray-500 text-center'>
                            Create your own voice commands for faster note
                            taking
                        </p>
                    </div>

                    <div className='bg-white rounded-lg shadow-md p-6 flex flex-col items-center'>
                        <div className='h-12 w-12 rounded-md flex items-center justify-center bg-indigo-100 text-indigo-600 mb-4'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                                className='h-6 w-6'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                                />
                            </svg>
                        </div>
                        <h3 className='text-lg font-medium text-gray-900'>
                            Privacy First
                        </h3>
                        <p className='mt-2 text-sm text-gray-500 text-center'>
                            End-to-end encryption for your sensitive notes
                        </p>
                    </div>
                </div>
            </div>

            {/* Pricing Plans */}
            <div className='max-w-7xl mx-auto pb-24 px-4 sm:px-6 lg:px-8'>
                <div className='sm:flex sm:flex-col sm:align-center'>
                    <h2 className='text-3xl font-extrabold text-gray-900 sm:text-4xl'>
                        Choose Your Premium Plan
                    </h2>
                    <p className='mt-5 text-xl text-gray-500 max-w-2xl mx-auto'>
                        Select the plan that fits your needs and unlock all
                        premium features.
                    </p>
                </div>

                <div className='mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-4'>
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`rounded-lg shadow-md divide-y divide-gray-200 flex flex-col ${
                                plan.popular
                                    ? 'border-2 border-indigo-500 ring-2 ring-indigo-200'
                                    : 'border border-gray-200'
                            } ${
                                selectedPlan === plan.id
                                    ? 'bg-indigo-50'
                                    : 'bg-white'
                            }`}
                        >
                            {plan.popular && (
                                <div className='bg-indigo-500 text-white text-xs font-semibold py-1 px-3 rounded-t-lg text-center'>
                                    MOST POPULAR
                                </div>
                            )}
                            <div className='p-6'>
                                <h3 className='text-lg font-medium text-gray-900'>
                                    {plan.name}
                                </h3>
                                <p className='mt-2 text-sm text-gray-500'>
                                    {plan.description}
                                </p>
                                <p className='mt-4'>
                                    <span className='text-3xl font-extrabold text-gray-900'>
                                        ${plan.price}
                                    </span>
                                    <span className='text-base font-medium text-gray-500'>
                                        /{plan.duration}
                                    </span>
                                </p>
                                {plan.savePercent && (
                                    <p className='mt-1 text-sm text-green-600 font-medium'>
                                        Save {plan.savePercent}% compared to
                                        monthly
                                    </p>
                                )}
                            </div>
                            <div className='pt-6 pb-8 px-6'>
                                <h4 className='text-sm font-medium text-gray-900 tracking-wide uppercase'>
                                    What&apos;s included
                                </h4>
                                <ul className='mt-4 space-y-3'>
                                    {plan.features.map((feature, index) => (
                                        <li
                                            key={index}
                                            className='flex items-start'
                                        >
                                            <div className='flex-shrink-0'>
                                                <Check className='h-5 w-5 text-green-500' />
                                            </div>
                                            <p className='ml-3 text-sm text-gray-700'>
                                                {feature}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                                <div className='mt-8'>
                                    <button
                                        type='button'
                                        className={`block w-full py-3 px-4 rounded-md shadow ${
                                            selectedPlan === plan.id
                                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                : 'bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-600'
                                        } text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                        onClick={() =>
                                            handlePlanSelection(plan.id)
                                        }
                                    >
                                        {selectedPlan === plan.id
                                            ? 'Selected'
                                            : 'Select Plan'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='mt-12 flex justify-center'>
                    <button
                        onClick={handleSubscribe}
                        className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    >
                        Subscribe Now
                    </button>
                </div>

                <div className='mt-8 text-center'>
                    <p className='text-sm text-gray-500'>
                        All plans include a 7-day free trial. No credit card
                        required until trial ends.
                    </p>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className='bg-gray-50 py-16'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <h2 className='text-3xl font-extrabold text-gray-900 text-center'>
                        Loved by users worldwide
                    </h2>
                    <div className='mt-12 grid gap-8 md:grid-cols-3 lg:gap-x-12'>
                        <div className='bg-white p-6 rounded-lg shadow'>
                            <div className='flex items-center mb-4'>
                                <div className='h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center'>
                                    <span className='text-xl font-bold text-indigo-600'>
                                        JD
                                    </span>
                                </div>
                                <div className='ml-4'>
                                    <h4 className='text-lg font-medium text-gray-900'>
                                        John Doe
                                    </h4>
                                    <p className='text-sm text-gray-500'>
                                        Marketing Manager
                                    </p>
                                </div>
                            </div>
                            <p className='text-gray-600'>
                                &quot;VoiceNotes has completely transformed
                                how I capture ideas on the go. The voice
                                control is incredibly accurate and the
                                organization features save me hours each
                                week.&quot;
                            </p>
                        </div>

                        <div className='bg-white p-6 rounded-lg shadow'>
                            <div className='flex items-center mb-4'>
                                <div className='h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center'>
                                    <span className='text-xl font-bold text-indigo-600'>
                                        SM
                                    </span>
                                </div>
                                <div className='ml-4'>
                                    <h4 className='text-lg font-medium text-gray-900'>
                                        Sarah Miller
                                    </h4>
                                    <p className='text-sm text-gray-500'>
                                        Author & Blogger
                                    </p>
                                </div>
                            </div>
                            <p className='text-gray-600'>
                                &quot;As a writer, I need to capture ideas
                                quickly. VoiceNotes Premium lets me speak my
                                thoughts and organizes them perfectly. The
                                cloud sync between my devices is
                                seamless.&quot;
                            </p>
                        </div>

                        <div className='bg-white p-6 rounded-lg shadow'>
                            <div className='flex items-center mb-4'>
                                <div className='h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center'>
                                    <span className='text-xl font-bold text-indigo-600'>
                                        RJ
                                    </span>
                                </div>
                                <div className='ml-4'>
                                    <h4 className='text-lg font-medium text-gray-900'>
                                        Robert Johnson
                                    </h4>
                                    <p className='text-sm text-gray-500'>
                                        Product Manager
                                    </p>
                                </div>
                            </div>
                            <p className='text-gray-600'>
                                &quot;The custom voice commands feature is
                                game-changing. I&apos;ve set up shortcuts
                                for my most common notes and can now
                                document meetings without touching my
                                keyboard.&quot;
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className='max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8'>
                <h2 className='text-3xl font-extrabold text-gray-900 text-center'>
                    Frequently Asked Questions
                </h2>
                <div className='mt-12 grid gap-6 lg:grid-cols-2'>
                    <div className='bg-white rounded-lg shadow-sm p-6'>
                        <h3 className='text-lg font-medium text-gray-900'>
                            How does the 7-day free trial work?
                        </h3>
                        <p className='mt-2 text-gray-600'>
                            You can start using all premium features
                            immediately. We&apos;ll send you a reminder
                            before your trial ends, and you won&apos;t be
                            charged if you cancel before the trial period is
                            over.
                        </p>
                    </div>

                    <div className='bg-white rounded-lg shadow-sm p-6'>
                        <h3 className='text-lg font-medium text-gray-900'>
                            Can I change my plan later?
                        </h3>
                        <p className='mt-2 text-gray-600'>
                            Yes, you can upgrade or downgrade your plan at
                            any time. When upgrading, you&apos;ll only pay
                            the prorated difference. When downgrading, the
                            new rate will apply to your next billing cycle.
                        </p>
                    </div>

                    <div className='bg-white rounded-lg shadow-sm p-6'>
                        <h3 className='text-lg font-medium text-gray-900'>
                            What payment methods do you accept?
                        </h3>
                        <p className='mt-2 text-gray-600'>
                            We accept all major credit cards, PayPal, and
                            Apple Pay. All transactions are secure and
                            encrypted.
                        </p>
                    </div>

                    <div className='bg-white rounded-lg shadow-sm p-6'>
                        <h3 className='text-lg font-medium text-gray-900'>
                            Is my data secure with VoiceNotes Premium?
                        </h3>
                        <p className='mt-2 text-gray-600'>
                            Absolutely. We use bank-level encryption for all
                            your notes and voice data. Your information is
                            never shared with third parties and is fully
                            encrypted end-to-end.
                        </p>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className='bg-indigo-700'>
                <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between'>
                    <h2 className='text-3xl font-extrabold tracking-tight text-white sm:text-4xl'>
                        <span className='block'>
                            Ready to boost your productivity?
                        </span>
                        <span className='block text-indigo-200'>
                            Start your free trial today.
                        </span>
                    </h2>
                    <div className='mt-8 flex lg:mt-0 lg:flex-shrink-0'>
                        <div className='inline-flex rounded-md shadow'>
                            <button
                                onClick={handleSubscribe}
                                className='inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50'
                            >
                                Get started
                            </button>
                        </div>
                        <div className='ml-3 inline-flex rounded-md shadow'>
                            <a
                                href='#'
                                className='inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700'
                            >
                                Learn more
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className='bg-white'>
                <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 md:flex md:items-center md:justify-between'>
                    <div className='flex justify-center space-x-6 md:order-2'>
                        <a
                            href='#'
                            className='text-gray-400 hover:text-gray-500'
                        >
                            <span className='sr-only'>Facebook</span>
                            <svg
                                className='h-6 w-6'
                                fill='currentColor'
                                viewBox='0 0 24 24'
                                aria-hidden='true'
                            >
                                <path
                                    fillRule='evenodd'
                                    d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                                    clipRule='evenodd'
                                />
                            </svg>
                        </a>

                        <a
                            href='#'
                            className='text-gray-400 hover:text-gray-500'
                        >
                            <span className='sr-only'>Twitter</span>
                            <svg
                                className='h-6 w-6'
                                fill='currentColor'
                                viewBox='0 0 24 24'
                                aria-hidden='true'
                            >
                                <path d='M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' />
                            </svg>
                        </a>

                        <a
                            href='#'
                            className='text-gray-400 hover:text-gray-500'
                        >
                            <span className='sr-only'>Instagram</span>
                            <svg
                                className='h-6 w-6'
                                fill='currentColor'
                                viewBox='0 0 24 24'
                                aria-hidden='true'
                            >
                                <path
                                    fillRule='evenodd'
                                    d='M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z'
                                    clipRule='evenodd'
                                />
                            </svg>
                        </a>
                    </div>
                    <div className='mt-8 md:mt-0 md:order-1'>
                        <p className='text-center text-base text-gray-400'>
                            &copy; 2025 VoiceNotes, Inc. All rights
                            reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default SubscriptionPage;
