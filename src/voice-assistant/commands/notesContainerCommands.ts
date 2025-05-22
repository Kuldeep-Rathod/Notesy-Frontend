import { RefObject } from 'react';
import { NoteI } from '@/interfaces/notes';

interface NotesContainerCommandsParams {
    refs: {
        searchInputRef: RefObject<HTMLInputElement | null>;
    };
    setters: {
        setSearchQuery: (query: string) => void;
        setViewType: (view: 'grid' | 'list') => void;
    };
    notes: NoteI[];
    openNote: (note: NoteI) => void;
}

export const getNotesContainerCommands = ({
    refs,
    setters,
    notes,
    openNote,
}: NotesContainerCommandsParams) => [
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
    {
        command: [
            'open note *',
            'edit not *',
            'open the note *',
            'edit the note *',
        ],
        callback: (title: string) => {
            if (!title?.trim() || !notes?.length) return;

            console.log('title', title);

            const normalizedTitle = title.toLowerCase().trim();
            const matchingNote = notes.find((note) =>
                note.noteTitle?.toLowerCase().includes(normalizedTitle)
            );

            if (matchingNote) {
                openNote(matchingNote);
            }
        },
        isFuzzyMatch: false,
        matchInterim: false,
    },
];
