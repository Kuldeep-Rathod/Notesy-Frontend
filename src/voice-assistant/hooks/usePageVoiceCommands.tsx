'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition';

type VoiceCommand = {
    command: string | string[];
    callback: (...args: any[]) => void;
    matchInterim?: boolean;
    isFuzzyMatch?: boolean;
    fuzzyMatchingThreshold?: number;
    bestMatchOnly?: boolean;
};

type PageCommands = {
    [path: string]: VoiceCommand[];
};

/**
 * Hook for adding page-specific voice commands
 * @param pageCommands Object with page paths as keys and arrays of commands as values
 * @param options Additional options
 */
const usePageVoiceCommands = (
    pageCommands: PageCommands,
    options: {
        debug?: boolean;
        requireWakeWord?: boolean;
    } = {}
) => {
    const pathname = usePathname();
    const [isActive, setIsActive] = useState(false);
    const [lastTranscript, setLastTranscript] = useState('');

    // Default options
    const { debug = false, requireWakeWord = true } = options;

    // Get commands for current page
    const currentPageCommands = pageCommands[pathname] || [];

    // Add wake word filter if required
    const processedCommands = requireWakeWord
        ? currentPageCommands.map((cmd) => ({
              ...cmd,
              callback: (...args: any[]) => {
                  if (isActive) {
                      cmd.callback(...args);
                  } else if (debug) {
                      console.log(
                          'Command ignored: Voice assistant not active'
                      );
                  }
              },
          }))
        : currentPageCommands;

    // Initialize speech recognition with current page commands
    const { transcript, browserSupportsSpeechRecognition } =
        useSpeechRecognition({
            commands: processedCommands,
        });

    // Listen for wake word from the global voice router
    // Automatically activate voice assistant for specific paths

    useEffect(() => {
        const handleVoiceActivation = (event: Event) => {
            const customEvent = event as CustomEvent; // Cast the event to CustomEvent
            const globalActive = customEvent.detail.isActive;
            const isDashboard = pathname.startsWith('/dashboard');
            const isArchive = pathname.startsWith('/archive');
            const shouldActivate = globalActive && (isDashboard || isArchive);

            setIsActive(shouldActivate);

            if (debug) {
                console.log(
                    `[VoiceAssistant Hook] Event triggered — Path: ${pathname}, Global: ${globalActive}, Hook active: ${shouldActivate}`
                );
            }
        };

        // Listen for the `voiceAssistantStateChange` event on mount
        window.addEventListener(
            'voiceAssistantStateChange',
            handleVoiceActivation as EventListener
        );

        // Immediately check if voice assistant is active on mount
        const globalActiveNow = (window as any).voiceAssistantActive ?? false;
        const isDashboardNow = pathname.startsWith('/dashboard');
        const isArchiveNow = pathname.startsWith('/archive');
        const shouldActivateNow = globalActiveNow && (isDashboardNow || isArchiveNow);

        setIsActive(shouldActivateNow);

        if (debug) {
            console.log(
                `[VoiceAssistant Hook] Initial mount — Path: ${pathname}, Global: ${globalActiveNow}, Hook active: ${shouldActivateNow}`
            );
        }

        return () => {
            // Cleanup the event listener when the component unmounts
            window.removeEventListener(
                'voiceAssistantStateChange',
                handleVoiceActivation as EventListener
            );
        };
    }, [pathname, debug]);

    // Log transcripts in debug mode
    useEffect(() => {
        if (debug && transcript && transcript !== lastTranscript) {
            console.log(`Page voice command transcript: ${transcript}`);
            setLastTranscript(transcript);
        }
    }, [transcript, lastTranscript, debug]);

    return {
        isActive,
        transcript,
        browserSupportsSpeechRecognition,
        currentPath: pathname,
    };
};

export default usePageVoiceCommands;
