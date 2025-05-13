import { RefObject } from 'react';

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
                refs.noteInputRef.current.click();
            }
        },
        isFuzzyMatch: true,
        fuzzyMatchingThreshold: 0.7,
    },
    {
        command: ['search *', 'find *', 'look for *'],
        callback: (query: string) => {
            setters.setSearchQuery(query);
            if (refs.searchInputRef.current) {
                refs.searchInputRef.current.focus();
                refs.searchInputRef.current.value = query;
            }
        },
        isFuzzyMatch: true,
        fuzzyMatchingThreshold: 0.7,
    },
    {
        command: ['clear search', 'reset search'],
        callback: () => {
            setters.setSearchQuery('');
            if (refs.searchInputRef.current) {
                refs.searchInputRef.current.value = '';
                refs.searchInputRef.current.focus();
            }
        },
    },
    {
        command: ['grade view', 'switch to grid', 'show grid'],
        callback: () => {
            setters.setViewType('grid');
        },
    },
    {
        command: ['list view', 'switch to list', 'show list'],
        callback: () => {
            setters.setViewType('list');
        },
    },
];
