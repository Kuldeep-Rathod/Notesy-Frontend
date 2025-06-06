'use client';

import { useGetCurrentUserQuery } from '@/redux/api/userAPI';
import { selectNoteInput } from '@/redux/reducer/noteInputReducer';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSpeechRecognition } from 'react-speech-recognition';

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
    const { data: userData } = useGetCurrentUserQuery();
    const isPremium = userData?.isPremium;

    const { labels } = useSelector(selectNoteInput); // ✅ Access Redux labels
    const labelNames = labels.map((label) => label.name);

    const { debug = false, requireWakeWord = true } = options;

    const currentPageCommands = pageCommands[pathname] || [];

    const processedCommands = requireWakeWord
        ? currentPageCommands.map((cmd) => ({
              ...cmd,
              callback: (...args: any[]) => {
                  if (!isPremium) {
                      if (debug) {
                          console.log('Command ignored: Premium feature only');
                      }
                      return;
                  }
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

    const { transcript, browserSupportsSpeechRecognition } =
        useSpeechRecognition({
            commands: processedCommands,
        });

    useEffect(() => {
        const handleVoiceActivation = (event: Event) => {
            const customEvent = event as CustomEvent;
            const globalActive = customEvent.detail.isActive;

            const cleanPath = pathname.replace(/^\//, '');
            const isDashboard = pathname.startsWith('/dashboard');
            const isReminder = pathname.startsWith('/reminder');
            const isArchive = pathname.startsWith('/archive');
            const isLabels = pathname.startsWith('/labels');
            const isTrash = pathname.startsWith('/trash');
            const isBoards = pathname.startsWith('/boards');
            const isLabelPage = labelNames.includes(cleanPath);

            const shouldActivate =
                globalActive &&
                isPremium &&
                (isDashboard ||
                    isArchive ||
                    isReminder ||
                    isLabelPage ||
                    isLabels ||
                    isTrash ||
                    isBoards);

            setIsActive(shouldActivate);

            if (debug) {
                console.log(
                    `[VoiceAssistant Hook] Event triggered — Path: ${pathname}, Global: ${globalActive}, Hook active: ${shouldActivate}, Premium: ${isPremium}`
                );
            }
        };

        window.addEventListener(
            'voiceAssistantStateChange',
            handleVoiceActivation as EventListener
        );

        const globalActiveNow = (window as any).voiceAssistantActive ?? false;
        const cleanPathNow = pathname.replace(/^\//, '');
        const isDashboardNow = pathname.startsWith('/dashboard');
        const isReminderNow = pathname.startsWith('/reminder');
        const isArchiveNow = pathname.startsWith('/archive');
        const isLabelsNow = pathname.startsWith('/labels');
        const isTrashNow = pathname.startsWith('/trash');
        const isBoardsNow = pathname.startsWith('/boards');
        const isLabelPageNow = labelNames.includes(cleanPathNow);

        const shouldActivateNow =
            globalActiveNow &&
            (isDashboardNow ||
                isArchiveNow ||
                isReminderNow ||
                isLabelPageNow ||
                isLabelsNow ||
                isTrashNow ||
                isBoardsNow);

        setIsActive(shouldActivateNow);

        // if (debug) {
        //     console.log(
        //         `[VoiceAssistant Hook] Initial mount — Path: ${pathname}, Global: ${globalActiveNow}, Hook active: ${shouldActivateNow}`
        //     );
        // }

        return () => {
            window.removeEventListener(
                'voiceAssistantStateChange',
                handleVoiceActivation as EventListener
            );
        };
    }, [pathname, debug, labelNames, isPremium]);

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
