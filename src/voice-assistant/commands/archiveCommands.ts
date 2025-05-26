import { RefObject } from 'react';

interface ArchiveCommandsParams {
    refs: {
        searchInputRef: RefObject<HTMLInputElement | null>;
    };
    setters: {
        setSearchQuery: (query: string) => void;
        setViewType: (view: 'grid' | 'list') => void;
    };
}

export const getArchiveCommands = ({
    refs,
    setters,
}: ArchiveCommandsParams) => [
    {
        command: ['search *', 'find *', 'look for *'],
        callback: (query: string) => {
            if (!query?.trim()) return;

            setters.setSearchQuery(query);

            const inputEl = refs.searchInputRef.current;
            if (inputEl) {
                inputEl.value = query;

                const inputEvent = new Event('input', { bubbles: true });
                inputEl.dispatchEvent(inputEvent);

                const changeEvent = new Event('change', { bubbles: true });
                inputEl.dispatchEvent(changeEvent);

                inputEl.focus();
            }
        },
        isFuzzyMatch: false,
        matchInterim: true,
    },

    {
        command: ['clear search', 'reset search'],
        callback: () => {
            setters.setSearchQuery('');
            if (refs.searchInputRef.current) {
                refs.searchInputRef.current.value = '';
                refs.searchInputRef.current.focus();

                const inputEvent = new Event('input', { bubbles: true });
                refs.searchInputRef.current.dispatchEvent(inputEvent);

                const changeEvent = new Event('change', { bubbles: true });
                refs.searchInputRef.current.dispatchEvent(changeEvent);
            }
        },
        isFuzzyMatch: true,
        fuzzyMatchingThreshold: 0.7,
    },
    {
        command: [
            'grid view',
            'grade view',
            'switch to grid',
            'switch to grade',
            'show grid',
            'show grade',
        ],
        callback: () => {
            setters.setViewType('grid');
        },
        isFuzzyMatch: true,
        fuzzyMatchingThreshold: 0.7,
    },
    {
        command: ['list view', 'switch to list', 'show list'],
        callback: () => {
            setters.setViewType('list');
        },
        isFuzzyMatch: true,
        fuzzyMatchingThreshold: 0.7,
    },
];
