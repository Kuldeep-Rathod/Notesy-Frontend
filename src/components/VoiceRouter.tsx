'use client';

import { RootState } from '@/redux/store';
import { debounce } from 'lodash-es';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition';

const VoiceRouter = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    const router = useRouter();
    const isDev = process.env.NODE_ENV === 'development';
    const validRoutes = ['dashboard', 'archive', 'bin', 'profile'];
    const [isActive, setIsActive] = useState(false);
    const [hasUserGesture, setHasUserGesture] = useState(false);
    const [showGesturePrompt, setShowGesturePrompt] = useState(true);

    const debouncedRouterPush = useMemo(
        () => debounce((route: string) => router.push(route), 500),
        [router]
    );

    const speak = (text: string) => {
        if (!('speechSynthesis' in window)) {
            console.error('Speech synthesis not supported');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
        };

        utterance.onend = () => {
            if (isDev) console.log('Speech synthesis completed');
        };

        try {
            window.speechSynthesis.speak(utterance);
            if (isDev) console.log('Speaking:', text);
        } catch (error) {
            console.error('Failed to speak:', error);
        }
    };

    const commands = useMemo(
        () => [
            {
                command: ['hey assistant', 'hey notsy'],
                callback: () => {
                    if (!hasUserGesture) {
                        if (isDev) console.warn('Waiting for user interaction');
                        return;
                    }
                    setIsActive(true);
                    console.log(user?.fullName);

                    speak(`Hey ${user?.fullName}, how can I assist you?`);
                },
                isFuzzyMatch: true,
                fuzzyMatchingThreshold: 0.6,
            },
            {
                command: ['go to *', 'navigate to *', 'hey app go to *'],
                callback: (page: string) => {
                    if (!isActive) return;

                    const route = page.toLowerCase().replace(/\s+/g, '');
                    if (validRoutes.includes(route)) {
                        debouncedRouterPush(`/${route}`);
                        speak(`Navigating to ${page}`);
                    } else if (isDev) {
                        console.warn(`Invalid route: ${route}`);
                        speak(`I couldn't find the ${page} page`);
                    }
                },
            },
            {
                command: 'never mind',
                callback: () => {
                    setIsActive(false);
                    speak('Okay, let me know if you need anything else');
                    if (isDev) console.log('Deactivated voice control');
                },
            },
        ],
        [debouncedRouterPush, isDev, isActive, hasUserGesture, validRoutes]
    );

    const { browserSupportsSpeechRecognition } = useSpeechRecognition({
        commands,
    });

    useEffect(() => {
        // Pre-warm speech synthesis
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(' ');
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            if (isDev)
                console.warn('Browser does not support speech recognition');
            return;
        }

        const startListening = async () => {
            try {
                await SpeechRecognition.startListening({
                    continuous: true,
                    language: 'en-US',
                });
            } catch (error) {
                if (isDev) console.error('Speech recognition error:', error);
            }
        };

        startListening();

        return () => {
            SpeechRecognition.stopListening();
            debouncedRouterPush.cancel();
        };
    }, [browserSupportsSpeechRecognition, isDev, debouncedRouterPush]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isActive) {
                setIsActive(false);
                speak('Voice control deactivated due to inactivity');
                if (isDev) console.log('Auto-deactivated due to inactivity');
            }
        }, 30000);

        return () => clearTimeout(timeout);
    }, [isActive, isDev]);

    useEffect(() => {
        const handleUserInteraction = () => {
            setHasUserGesture(true);
            setShowGesturePrompt(false);
            window.removeEventListener('click', handleUserInteraction);
            window.removeEventListener('keydown', handleUserInteraction);
        };

        window.addEventListener('click', handleUserInteraction);
        window.addEventListener('keydown', handleUserInteraction);
    }, []);

    return (
        <div style={{ position: 'relative' }}>
            {showGesturePrompt && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        fontSize: '1.5rem',
                    }}
                >
                    Click or press any key to activate voice assistant.
                </div>
            )}

            {isDev && (
                <div
                    style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        background: '#eee',
                        padding: 8,
                    }}
                >
                    <p>Voice control: {isActive ? 'Active' : 'Inactive'}</p>
                    <p>User gesture: {hasUserGesture ? 'Yes' : 'No'}</p>
                </div>
            )}
        </div>
    );
};

export default VoiceRouter;
