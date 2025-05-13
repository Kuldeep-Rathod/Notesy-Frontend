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
    const validRoutes = [
        'dashboard',
        'archive',
        'trash',
        'profile',
        'reminders',
    ];
    const [isActive, setIsActive] = useState(false);
    const [hasUserGesture, setHasUserGesture] = useState(false);
    const [showGesturePrompt, setShowGesturePrompt] = useState(true);

    // ✅ NEW: Track last interaction time
    const [lastInteractionTime, setLastInteractionTime] = useState<number>(
        Date.now()
    );

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
                    setLastInteractionTime(Date.now()); // ✅ Update time
                    console.log(
                        'Wake word detected, user:',
                        user?.fullName || 'Unknown'
                    );

                    speak(
                        `Hey ${
                            user?.fullName || 'there'
                        }, how can I assist you?`
                    );
                },
                isFuzzyMatch: true,
                fuzzyMatchingThreshold: 0.5,
            },
            {
                command: ['go to *', 'navigate to *', 'hey app go to *'],
                callback: (page: string) => {
                    if (!isActive) {
                        console.log(
                            'Command received but voice control not active'
                        );
                        return;
                    }

                    setLastInteractionTime(Date.now()); // ✅ Update time
                    const route = page.toLowerCase().replace(/\s+/g, '');
                    console.log('Navigation command received for:', route);
                    if (validRoutes.includes(route)) {
                        debouncedRouterPush(`/${route}`);
                        speak(`Navigating to ${page}`);
                    } else {
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
        [
            debouncedRouterPush,
            isDev,
            isActive,
            hasUserGesture,
            validRoutes,
            user,
        ]
    );

    const { transcript, browserSupportsSpeechRecognition } =
        useSpeechRecognition({ commands });

    useEffect(() => {
        // Pre-warm speech synthesis
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(' ');
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            console.warn('Browser does not support speech recognition');
            return;
        }

        const startListening = async () => {
            try {
                console.log('Starting speech recognition...');
                await SpeechRecognition.startListening({
                    continuous: true,
                    language: 'en-US',
                });
                console.log('Speech recognition started successfully');
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

    // ✅ Update interaction time on transcript change
    useEffect(() => {
        if (transcript && transcript.trim()) {
            setLastInteractionTime(Date.now());
        }
    }, [transcript]);

    // ✅ Auto-deactivate voice assistant after 30s of inactivity
    useEffect(() => {
        const interval = setInterval(() => {
            if (isActive && Date.now() - lastInteractionTime > 30000) {
                setIsActive(false);
                speak('Voice control deactivated due to inactivity');
                if (isDev) console.log('Auto-deactivated due to inactivity');
            }
        }, 5000); // check every 5s

        return () => clearInterval(interval);
    }, [isActive, lastInteractionTime, isDev]);

    useEffect(() => {
        const handleUserInteraction = () => {
            if (!hasUserGesture) {
                console.log('User gesture detected!');
                setHasUserGesture(true);
                setShowGesturePrompt(false);

                // Force restart speech recognition after user interaction
                if (browserSupportsSpeechRecognition) {
                    SpeechRecognition.startListening({
                        continuous: true,
                        language: 'en-US',
                    }).catch((e) =>
                        console.error('Error starting speech recognition:', e)
                    );
                }
            }
        };

        window.addEventListener('click', handleUserInteraction);
        window.addEventListener('keydown', handleUserInteraction);

        return () => {
            window.removeEventListener('click', handleUserInteraction);
            window.removeEventListener('keydown', handleUserInteraction);
        };
    }, [hasUserGesture, browserSupportsSpeechRecognition]);

    // Emit voice assistant state changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // ✅ Set global voice state
            (window as any).voiceAssistantActive = isActive;
    
            // ✅ Dispatch event
            const event = new CustomEvent('voiceAssistantStateChange', {
                detail: { isActive },
            });
            window.dispatchEvent(event);
            console.log(
                `Voice assistant ${isActive ? 'activated' : 'deactivated'}`
            );
        }
    }, [isActive]);
    

    if (!browserSupportsSpeechRecognition) {
        return (
            <div
                style={{
                    padding: '20px',
                    backgroundColor: '#ffdddd',
                    color: 'red',
                    borderRadius: '5px',
                    margin: '20px',
                    textAlign: 'center',
                }}
            >
                <p>Speech recognition is not supported in this browser.</p>
                <p>
                    Please try using Google Chrome or Microsoft Edge for voice
                    features.
                </p>
            </div>
        );
    }

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
                        flexDirection: 'column',
                        gap: '1rem',
                    }}
                >
                    <p>Click or press any key to activate voice assistant.</p>
                    <button
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4a90e2',
                            border: 'none',
                            borderRadius: '5px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1rem',
                        }}
                        onClick={() => {
                            setHasUserGesture(true);
                            setShowGesturePrompt(false);
                        }}
                    >
                        Activate Voice Assistant
                    </button>
                </div>
            )}

            <div
                style={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    backgroundColor: isActive ? '#4CAF50' : '#f1f1f1',
                    color: isActive ? 'white' : 'black',
                    padding: '10px 15px',
                    borderRadius: '50px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    zIndex: 100,
                    display: hasUserGesture ? 'block' : 'none',
                }}
            >
                {isActive
                    ? '🎙️ Voice Assistant Active'
                    : '🔇 Say "Hey Notsy" to activate'}
            </div>

            {(isDev || true) && hasUserGesture && (
                <div
                    style={{
                        position: 'fixed',
                        top: 10,
                        left: 10,
                        background: '#eee',
                        padding: 8,
                        borderRadius: '5px',
                        fontSize: '12px',
                        zIndex: 999,
                    }}
                >
                    <p>Voice control: {isActive ? 'Active' : 'Inactive'}</p>
                    <p>User gesture: {hasUserGesture ? 'Yes' : 'No'}</p>
                    <button
                        onClick={() => {
                            SpeechRecognition.startListening({
                                continuous: true,
                                language: 'en-US',
                            }).catch((e) => console.error('Error:', e));
                        }}
                    >
                        Restart Voice Recognition
                    </button>
                </div>
            )}
        </div>
    );
};

export default VoiceRouter;
