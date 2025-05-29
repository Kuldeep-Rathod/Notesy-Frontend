import { RefObject } from 'react';
import { speak } from '../VoiceRouter';

interface DashboardCommandsParams {
    refs: {
        noteInputRef: RefObject<HTMLDivElement | null>;
        searchInputRef: RefObject<HTMLInputElement | null>;
    };
    setters: {
        setSearchQuery: (query: string) => void;
        setViewType: (view: 'grid' | 'list') => void;
    };
}

export const getDashboardCommands = ({
    refs,
    setters,
}: DashboardCommandsParams) => [
    {
        command: ['create note', 'new note', 'add note'],
        callback: () => {
            if (refs.noteInputRef.current) {
                const noteInputPlaceholder =
                    refs.noteInputRef.current.querySelector(
                        '.note-input__placeholder'
                    ) ||
                    refs.noteInputRef.current.querySelector(
                        '.note-input__body--placeholder'
                    );

                if (noteInputPlaceholder instanceof HTMLElement) {
                    noteInputPlaceholder.click();
                } else {
                    // Fallback: try direct click
                    refs.noteInputRef.current.click();
                }

                speak('Creating a new note.');
            }
        },
        isFuzzyMatch: true,
        fuzzyMatchingThreshold: 0.7,
    },
];
