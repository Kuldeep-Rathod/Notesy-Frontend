'use client';

import {
    ArrowRight,
    CheckCircle,
    Mic,
    Play,
    Shield,
    Sparkles,
    Star,
    Users,
    Zap,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const HeroLandingPage = () => {
    const [isListening, setIsListening] = useState(false);
    const [currentCommand, setCurrentCommand] = useState('');
    const [typedText, setTypedText] = useState('');

    const voiceCommands = [
        'Create note',
        'Set title Meeting Notes',
        'Remind me tomorrow',
        'Add collaborator',
        'Search project ideas',
        'Archive completed tasks',
    ];

    const features = [
        {
            icon: <Mic className='w-6 h-6' />,
            title: 'Voice Control',
            description:
                'Create, edit, and manage notes entirely with your voice',
        },
        {
            icon: <Zap className='w-6 h-6' />,
            title: 'Lightning Fast',
            description: 'Instant note creation and search with voice commands',
        },
        {
            icon: <Users className='w-6 h-6' />,
            title: 'Collaboration',
            description:
                'Share and collaborate on notes with voice invitations',
        },
        {
            icon: <Shield className='w-6 h-6' />,
            title: 'Secure & Private',
            description: 'Your notes are encrypted and protected',
        },
    ];

    const testimonials = [
        {
            name: 'Sarah Chen',
            role: 'Product Manager',
            content:
                "Voice control has transformed how I take meeting notes. It's incredibly intuitive!",
            rating: 5,
        },
        {
            name: 'Marcus Johnson',
            role: 'Software Engineer',
            content:
                "The best note-taking app I've ever used. Voice commands are game-changing.",
            rating: 5,
        },
        {
            name: 'Emily Rodriguez',
            role: 'Designer',
            content:
                'Finally, a notes app that keeps up with my thoughts. Love the voice features!',
            rating: 5,
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            const randomCommand =
                voiceCommands[Math.floor(Math.random() * voiceCommands.length)];
            setCurrentCommand(randomCommand);

            // Simulate typing animation
            setTypedText('');
            let index = 0;
            const typeInterval = setInterval(() => {
                if (index < randomCommand.length) {
                    setTypedText(randomCommand.slice(0, index + 1));
                    index++;
                } else {
                    clearInterval(typeInterval);
                }
            }, 100);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const handleVoiceDemo = () => {
        setIsListening(!isListening);
        if (!isListening) {
            setTimeout(() => setIsListening(false), 3000);
        }
    };

    return (
        <div className='min-h-screen bg-slate-50 text-slate-900 overflow-hidden'>
            {/* Navigation */}
            <nav className='flex items-center justify-between p-6 max-w-7xl mx-auto'>
                <div className='flex items-center space-x-2'>
                    <div className='w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center'>
                        <Mic className='w-6 h-6 text-white' />
                    </div>
                    <span className='text-2xl font-bold text-slate-800'>
                        Notesy
                    </span>
                </div>

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
                    <button className='bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition-colors'>
                        <Link href='/login'>Sign In</Link>
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className='max-w-7xl mx-auto px-6 pt-20 pb-32'>
                <div className='grid lg:grid-cols-2 gap-12 items-center'>
                    {/* Left Content */}
                    <div className='space-y-8'>
                        <div className='inline-flex items-center space-x-2 bg-indigo-100 text-indigo-800 rounded-full px-4 py-2'>
                            <Sparkles className='w-4 h-4' />
                            <span className='text-sm font-medium'>
                                AI-Powered Voice Commands
                            </span>
                        </div>

                        <div className='space-y-6'>
                            <h1 className='text-5xl lg:text-7xl font-bold leading-tight text-slate-800'>
                                Take Notes with
                                <span className='block text-indigo-600'>
                                    Your Voice
                                </span>
                            </h1>

                            <p className='text-xl text-slate-600 leading-relaxed max-w-lg'>
                                The world&apos;s first truly voice-controlled
                                note-taking app. Create, edit, search, and
                                collaborate using nothing but your voice.
                            </p>
                        </div>

                        <div className='flex flex-col sm:flex-row gap-4'>
                            <button className='group bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 text-white'>
                                <Link href='/signup'>
                                    <span>Start Free Trial</span>
                                </Link>
                                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                            </button>

                            <button
                                onClick={handleVoiceDemo}
                                className='group border-2 border-slate-200 hover:border-indigo-300 px-8 py-4 rounded-full font-semibold text-lg transition-all flex items-center justify-center space-x-2 bg-white'
                            >
                                <Play className='w-5 h-5 text-indigo-600' />
                                <span>Watch Demo</span>
                            </button>
                        </div>

                        <div className='flex items-center space-x-6 text-sm text-slate-500'>
                            <div className='flex items-center space-x-2'>
                                <CheckCircle className='w-4 h-4 text-green-500' />
                                <span>No credit card required</span>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <CheckCircle className='w-4 h-4 text-green-500' />
                                <span>14-day free trial</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Interactive Demo */}
                    <div className='relative'>
                        <div className='bg-white border border-slate-200 rounded-3xl p-8 shadow-xl'>
                            <div className='flex items-center justify-between mb-6'>
                                <h3 className='text-xl font-semibold text-slate-800'>
                                    Voice Command Demo
                                </h3>
                                <div
                                    className={`w-4 h-4 rounded-full ${
                                        isListening
                                            ? 'bg-green-500 animate-pulse'
                                            : 'bg-slate-300'
                                    }`}
                                ></div>
                            </div>

                            <div className='space-y-4'>
                                <div className='bg-slate-50 rounded-xl p-4 border border-slate-100'>
                                    <div className='flex items-center space-x-3 mb-3'>
                                        <Mic
                                            className={`w-6 h-6 ${
                                                isListening
                                                    ? 'text-green-500'
                                                    : 'text-slate-400'
                                            }`}
                                        />
                                        <span className='text-sm text-slate-500'>
                                            Say a command:
                                        </span>
                                    </div>
                                    <div className='font-mono text-lg text-slate-800'>
                                        &quot;{typedText}&quot;
                                        <span className='animate-pulse'>|</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleVoiceDemo}
                                    className={`w-full py-4 rounded-xl font-semibold transition-all text-white ${
                                        isListening
                                            ? 'bg-green-500 hover:bg-green-600 animate-pulse'
                                            : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                                >
                                    {isListening
                                        ? 'Listening...'
                                        : 'Try Voice Command'}
                                </button>

                                <div className='grid grid-cols-2 gap-3'>
                                    {[
                                        'Create Note',
                                        'Set Reminder',
                                        'Search Notes',
                                        'Add Tag',
                                    ].map((cmd, idx) => (
                                        <div
                                            key={idx}
                                            className='bg-slate-50 rounded-lg p-3 text-center text-sm border border-slate-100'
                                        >
                                            {cmd}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div
                id='features'
                className='bg-slate-100'
            >
                <div className='max-w-7xl mx-auto px-6 py-24'>
                    <div className='text-center mb-16'>
                        <h2 className='text-4xl font-bold mb-4 text-slate-800'>
                            Powerful Features
                        </h2>
                        <p className='text-xl text-slate-600 max-w-2xl mx-auto'>
                            Everything you need to revolutionize your
                            note-taking experience
                        </p>
                    </div>

                    <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className='group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all hover:scale-[1.02]'
                            >
                                <div className='w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors'>
                                    {React.cloneElement(feature.icon, {
                                        className: 'w-6 h-6 text-indigo-600',
                                    })}
                                </div>
                                <h3 className='text-xl font-semibold mb-2 text-slate-800'>
                                    {feature.title}
                                </h3>
                                <p className='text-slate-600'>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div
                id='testimonials'
                className='max-w-7xl mx-auto px-6 py-24'
            >
                <div className='text-center mb-16'>
                    <h2 className='text-4xl font-bold mb-4 text-slate-800'>
                        Loved by thousands
                    </h2>
                    <p className='text-xl text-slate-600'>
                        See what our users are saying
                    </p>
                </div>

                <div className='grid md:grid-cols-3 gap-8'>
                    {testimonials.map((testimonial, idx) => (
                        <div
                            key={idx}
                            className='bg-white border border-slate-200 rounded-2xl p-6 shadow-sm'
                        >
                            <div className='flex items-center mb-4'>
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className='w-5 h-5 text-yellow-400 fill-current'
                                    />
                                ))}
                            </div>
                            <p className='text-slate-600 mb-4 italic'>
                                &quot;{testimonial.content}&quot;
                            </p>
                            <div>
                                <div className='font-semibold text-slate-800'>
                                    {testimonial.name}
                                </div>
                                <div className='text-slate-500 text-sm'>
                                    {testimonial.role}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className='bg-indigo-600'>
                <div className='max-w-4xl mx-auto px-6 py-16 text-center'>
                    <h2 className='text-4xl font-bold mb-4 text-white'>
                        Ready to transform your note-taking?
                    </h2>
                    <p className='text-xl mb-8 text-indigo-100'>
                        Join thousands of users who&apos;ve revolutionized their
                        productivity
                    </p>

                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <button className='bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-100 transition-colors'>
                            <Link href='/signup'>Start Free Trial</Link>
                        </button>
                        <button className='border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-700 transition-colors'>
                            <Link href='/pricing'> View Pricing</Link>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className='border-t border-slate-200 bg-white'>
                <div className='max-w-7xl mx-auto px-6 py-12'>
                    <div className='grid md:grid-cols-4 gap-8'>
                        <div>
                            <div className='flex items-center space-x-2 mb-4'>
                                <div className='w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center'>
                                    <Mic className='w-5 h-5 text-white' />
                                </div>
                                <span className='text-xl font-bold text-slate-800'>
                                    Notesy
                                </span>
                            </div>
                            <p className='text-slate-500'>
                                The future of note-taking is here.
                            </p>
                        </div>

                        <div>
                            <h4 className='font-semibold mb-4 text-slate-800'>
                                Product
                            </h4>
                            <div className='space-y-2 text-slate-500'>
                                <div>Features</div>
                                <div>Pricing</div>
                                <div>Security</div>
                            </div>
                        </div>

                        <div>
                            <h4 className='font-semibold mb-4 text-slate-800'>
                                Company
                            </h4>
                            <div className='space-y-2 text-slate-500'>
                                <div>About</div>
                                <div>Blog</div>
                                <div>Careers</div>
                            </div>
                        </div>

                        <div>
                            <h4 className='font-semibold mb-4 text-slate-800'>
                                Support
                            </h4>
                            <div className='space-y-2 text-slate-500'>
                                <div>Help Center</div>
                                <div>Contact</div>
                                <div>Status</div>
                            </div>
                        </div>
                    </div>

                    <div className='border-t border-slate-200 mt-12 pt-8 text-center text-slate-500'>
                        <p>&copy; 2025 Notesy. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HeroLandingPage;
