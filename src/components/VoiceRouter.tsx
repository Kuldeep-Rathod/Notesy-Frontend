// 'use client';

// import { useEffect, useMemo } from 'react';
// import SpeechRecognition, {
//     useSpeechRecognition,
// } from 'react-speech-recognition';
// import { useRouter } from 'next/navigation';
// import { debounce } from 'lodash-es';

// const VoiceRouter = () => {
//     const router = useRouter();
//     const isDev = process.env.NODE_ENV === 'development';
//     const validRoutes = ['dashboard', 'archive', 'bin', 'profile'];

//     const debouncedRouterPush = useMemo(
//         () => debounce((route: string) => router.push(route), 500),
//         [router]
//     );

//     const commands = useMemo(
//         () => [
//             {
//                 command: ['go to *', 'navigate to *', 'hey app go to *'],
//                 callback: (page: string) => {
//                     const route = page.toLowerCase().replace(/\s+/g, '');
//                     if (validRoutes.includes(route)) {
//                         debouncedRouterPush(`/${route}`);
//                     } else if (isDev) {
//                         console.warn(`Invalid route: ${route}`);
//                     }
//                 },
//             },
//         ],
//         [debouncedRouterPush, isDev]
//     );

//     const {
//         transcript,
//         listening,
//         browserSupportsSpeechRecognition,
//         resetTranscript,
//     } = useSpeechRecognition({ commands });

//     useEffect(() => {
//         if (!browserSupportsSpeechRecognition) {
//             if (isDev)
//                 console.warn('Browser does not support speech recognition');
//             return;
//         }

//         const startListening = async () => {
//             try {
//                 await SpeechRecognition.startListening({
//                     continuous: true,
//                     language: 'en-US',
//                 });
//             } catch (error) {
//                 if (isDev) console.error('Speech recognition error:', error);
//             }
//         };

//         startListening();

//         return () => {
//             SpeechRecognition.stopListening();
//             debouncedRouterPush.cancel();
//         };
//     }, [browserSupportsSpeechRecognition, isDev, debouncedRouterPush]);

//     useEffect(() => {
//         const interval = setInterval(() => {
//             if (transcript.length > 1000) {
//                 resetTranscript();
//             }
//         }, 30000);

//         return () => clearInterval(interval);
//     }, [transcript, resetTranscript]);

//     return (
//         <div style={{ display: 'none' }}>
//             {isDev && (
//                 <>
//                     <p>Listening: {listening ? 'Yes' : 'No'}</p>
//                     <p>Transcript: {transcript}</p>
//                 </>
//             )}
//         </div>
//     );
// };

// export default VoiceRouter;

'use client';

import { useEffect, useMemo, useState } from 'react';
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash-es';

const VoiceRouter = () => {
    const router = useRouter();
    const isDev = process.env.NODE_ENV === 'development';
    const validRoutes = ['dashboard', 'archive', 'bin', 'profile'];
    const [isActive, setIsActive] = useState(false);

    const debouncedRouterPush = useMemo(
        () => debounce((route: string) => router.push(route), 500),
        [router]
    );

    const commands = useMemo(
        () => [
            // Wake-up command
            {
                command: ['hey assistant', 'hey notsy'],
                callback: () => {
                    setIsActive(true);
                    if (isDev) console.log('Wake-up command detected');

                    if ('speechSynthesis' in window) {
                        console.log('Speech Synthesis is supported');
                    } else {
                        console.error('Speech Synthesis is not supported');
                    }

                    // Play sound (Text-to-Speech)
                    const wakeUpMessage = 'Hey Kuldeep, how can I assist you?';
                    const utterance = new SpeechSynthesisUtterance(
                        wakeUpMessage
                    );
                    console.log(utterance);
                    speechSynthesis.speak(utterance);

                    // Optional: Visual feedback can be added as well
                },
                isFuzzyMatch: true,
                fuzzyMatchingThreshold: 0.6,
            },
            // Navigation commands (only active after wake-up)
            {
                command: ['go to *', 'navigate to *', 'hey app go to *'],
                callback: (page: string) => {
                    if (!isActive) return;

                    const route = page.toLowerCase().replace(/\s+/g, '');
                    if (validRoutes.includes(route)) {
                        debouncedRouterPush(`/${route}`);
                    } else if (isDev) {
                        console.warn(`Invalid route: ${route}`);
                    }
                    // setIsActive(false); // Deactivate after command
                },
            },
            // Cancel command
            {
                command: 'never mind',
                callback: () => {
                    setIsActive(false);
                    if (isDev) console.log('Deactivated voice control');
                },
            },
        ],
        [debouncedRouterPush, isDev, isActive]
    );

    const { browserSupportsSpeechRecognition, resetTranscript } =
        useSpeechRecognition({ commands });

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            if (isDev)
                console.warn('Browser does not support speech recognition');
            return;
        }

        // Start listening continuously but only process commands when active
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
        // Timeout to automatically deactivate if no command is given
        const timeout = setTimeout(() => {
            if (isActive) {
                setIsActive(false);
                if (isDev) console.log('Auto-deactivated due to inactivity');
            }
        }, 30000); // 10 seconds timeout

        return () => clearTimeout(timeout);
    }, [isActive, isDev]);

    return (
        <div style={{ display: 'none' }}>
            {isDev && (
                <>
                    <p>Voice control: {isActive ? 'Active' : 'Inactive'}</p>
                    {/* Other debug info */}
                </>
            )}
        </div>
    );
};

export default VoiceRouter;
