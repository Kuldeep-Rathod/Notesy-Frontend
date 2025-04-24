'use client';

import GradientBackgroundBottom from '@/components/GradientBackgroundBottom';
import GradientBackgroundTop from '@/components/GradientBackgroundTop';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import '../styles/app/_home.scss';

export default function Home() {
    return (
        <div className='hero-wrapper'>
            <Navbar />

            <div className='hero-content-wrapper'>
                <GradientBackgroundTop />
                <div className='hero-content'>
                    <div className='hero-badge'>
                        <Button
                            variant='outline'
                            className='hero-badge-text'
                            asChild
                        >
                            <span>
                                Voice-controlled Note App like Google Keep
                            </span>
                        </Button>
                    </div>
                    <div className='text-container'>
                        <h1 className='hero-title'>
                            Take notes with just your voice
                        </h1>
                        <p className='hero-description'>
                            Notesy lets you create, organize, and manage your
                            notes with simple voice commands. Say goodbye to
                            typing and hello to smarter note-taking.
                        </p>
                        <div className='cta-buttons'>
                            <Button
                                asChild
                                className='cta-primary'
                            >
                                <Link href='/signup'>Start Free</Link>
                            </Button>
                            <Button
                                variant='outline'
                                asChild
                                className='cta-primary'
                            >
                                <Link href='/login'>Log in</Link>
                            </Button>
                        </div>
                    </div>
                </div>
                <GradientBackgroundBottom />
            </div>
        </div>
    );
}
