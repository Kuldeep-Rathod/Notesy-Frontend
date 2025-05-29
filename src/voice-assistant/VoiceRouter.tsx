'use client';

import { useLogoutMutation } from '@/redux/api/authAPI';
import { useGetLabelsQuery } from '@/redux/api/labelsAPI';
import { useGetCurrentUserQuery } from '@/redux/api/userAPI';
import { activateGesture } from '@/redux/reducer/gestureReducer';
import { RootState } from '@/redux/store';
import { axiosInstance } from '@/utils/axiosInstance';
import { getAuth } from 'firebase/auth';
import { debounce } from 'lodash-es';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition';
import { toast } from 'sonner';

export const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
        console.error('Speech synthesis not supported');
        return;
    }

    const synth = window.speechSynthesis;
    const voices = synth.getVoices();

    // Try to find Google UK English Female
    const selectedVoice = voices.find(
        (voice) => voice.name === 'Google UK English Female'
    );

    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    } else {
        console.warn('Preferred voice not found, using default voice.');
    }

    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
    };

    utterance.onend = () => {
        console.log('Speech synthesis completed');
    };

    try {
        synth.speak(utterance);
        console.log('Speaking:', text);
    } catch (error) {
        console.error('Failed to speak:', error);
    }
};

const VoiceRouter = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const { hasUserGesture } = useSelector((state: RootState) => state.gesture);

    const isAuthenticated = !!user;

    const { data: labelsData = [], isLoading: labelsLoading } =
        useGetLabelsQuery(undefined, {
            skip: !isAuthenticated,
        });

    const { data: userData, isLoading: userLoading } = useGetCurrentUserQuery(
        undefined,
        {
            skip: !isAuthenticated,
        }
    );

    const isPremium = userData?.isPremium;

    const [logout] = useLogoutMutation();

    const router = useRouter();
    const isDev = process.env.NODE_ENV === 'development';

    // Static routes
    const baseRoutes = [
        'dashboard',
        'archive',
        'trash',
        'profile',
        'labels',
        'reminders',
        'statistics',
    ];

    // Merge labels into routes
    const validRoutes = useMemo(() => {
        const labelRoutes = labelsData.map((label) => label.toLowerCase?.());
        return [...baseRoutes, ...labelRoutes];
    }, [labelsData]);

    const [isActive, setIsActive] = useState(false);

    // NEW: Track last interaction time
    const [lastInteractionTime, setLastInteractionTime] = useState<number>(
        Date.now()
    );

    const debouncedRouterPush = useMemo(
        () => debounce((route: string) => router.push(route), 500),
        [router]
    );

    useEffect(() => {
        if ('speechSynthesis' in window) {
            const loadVoices = () => {
                window.speechSynthesis.getVoices();
            };

            if (typeof window !== 'undefined') {
                loadVoices();
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }
        }
    }, []);

    const handleManagePlan = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                toast.error('User not authenticated');
                return;
            }

            const idToken = await user.getIdToken();

            const res = await axiosInstance.post(
                '/pay/create-portal-session',
                {}, // no body needed
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            window.location.href = res.data.url;
        } catch (err) {
            console.error('Error redirecting to Stripe portal:', err);
            toast.error('Error redirecting to Stripe portal');
        }
    };

    const handleLogout = async () => {
        try {
            await logout().unwrap();
            toast.success('User Logged out');
            await router.push('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const commands = useMemo(
        () => [
            {
                command: [
                    'hey assistant',
                    'hey notsy',
                    'hey notesy',
                    'hey app',
                    'hello assistant',
                    'hello notsy',
                    'hello notesy',
                    'hello app',
                ],
                callback: () => {
                    if (!hasUserGesture) {
                        if (isDev) console.warn('Waiting for user interaction');
                        return;
                    }
                    if (!isAuthenticated) {
                        speak('Please log in to use voice commands.');
                        return;
                    }
                    if (!isPremium) {
                        speak(
                            'This is a premium feature. Please upgrade to use voice commands.'
                        );
                        router.push('/upgrade');
                        return;
                    }
                    setIsActive(true);
                    setLastInteractionTime(Date.now());
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

                    setLastInteractionTime(Date.now()); // Update time
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
                command: ['logout user', 'signout user', 'sign out', 'log out'],
                callback: () => {
                    if (!isActive) return;
                    setLastInteractionTime(Date.now());
                    speak('Logging you out');
                    handleLogout();
                },
                isFuzzyMatch: true,
            },
            {
                command: [
                    'manage plans',
                    'manage subscription',
                    'subscription',
                    'manage billing',
                ],
                callback: () => {
                    if (!isActive) return;
                    setLastInteractionTime(Date.now());
                    speak('Showing your plans');
                    handleManagePlan();
                },
                isFuzzyMatch: true,
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
            isPremium,
            isAuthenticated,
            router,
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

        if (!isAuthenticated) {
            if (isDev)
                console.log(
                    'Waiting for user authentication before starting speech recognition'
                );
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
    }, [
        browserSupportsSpeechRecognition,
        isDev,
        debouncedRouterPush,
        isAuthenticated,
    ]);

    // Update interaction time on transcript change
    useEffect(() => {
        if (transcript && transcript.trim()) {
            setLastInteractionTime(Date.now());
        }
    }, [transcript]);

    // Auto-deactivate voice assistant after 60s of inactivity
    useEffect(() => {
        const interval = setInterval(() => {
            if (isActive && Date.now() - lastInteractionTime > 60000 * 2) {
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
                dispatch(activateGesture());

                if (browserSupportsSpeechRecognition && isAuthenticated) {
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
    }, [
        hasUserGesture,
        browserSupportsSpeechRecognition,
        dispatch,
        isAuthenticated,
    ]);

    // Emit voice assistant state changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Set global voice state
            (window as any).voiceAssistantActive = isActive;

            // Dispatch event
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

    if (!isAuthenticated && (labelsLoading || userLoading)) {
        return (
            <div
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    padding: '8px 12px',
                    backgroundColor: '#f1f1f1',
                    borderRadius: '50px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontSize: '14px',
                }}
            >
                Loading voice assistant...
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div style={{ position: 'relative' }}>
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
                    display: hasUserGesture && isPremium ? 'block' : 'none',
                }}
            >
                {isActive
                    ? '🎙️ Voice Assistant Active'
                    : '🔇 Say "Hey Notsy" to activate'}
            </div>
        </div>
    );
};

export default VoiceRouter;
