import { NoteI } from '@/interfaces/notes';
import { RefObject } from 'react';
import { speak } from '../VoiceRouter';

interface NotesContainerCommandsParams {
    refs: {
        searchInputRef: RefObject<HTMLInputElement | null>;
    };
    setters: {
        setSearchQuery: (query: string) => void;
        setViewType: (view: 'grid' | 'list') => void;
    };
    handlers: {
        handleMoveToTrash: (noteId: string) => void;
        handleArchiveToggle: (noteId: string) => void;
        handleCloneNote: (noteId: string) => void;
        handlePinToggle: (noteId: string) => void;
        closeModal: () => void;
    };
    notes: NoteI[];
    openNote: (note: NoteI) => void;
}

export const getNotesContainerCommands = ({
    refs,
    setters,
    handlers,
    notes,
    openNote,
}: NotesContainerCommandsParams) => [
    {
        command: ['close note', 'discard changes'],
        callback: () => {
            handlers.closeModal();
            speak('Note closed.');
        },
        isFuzzyMatch: true,
    },
    {
        command: [
            'search notes *',
            'find notes *',
            'look notes for *',
            'search notes with *',
            'find notes with *',
        ],
        callback: (query: string) => {
            if (!query?.trim()) {
                speak('Please provide a search term.');
                return;
            }

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

            speak(`Searching for notes with: ${query}`);
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
            speak('Search cleared.');
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
            speak('Switched to grid view.');
        },
        isFuzzyMatch: true,
        fuzzyMatchingThreshold: 0.7,
    },
    {
        command: ['list view', 'switch to list', 'show list'],
        callback: () => {
            setters.setViewType('list');
            speak('Switched to list view.');
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
            if (!title?.trim()) {
                speak('Please specify a note title to open.');
                return;
            }

            if (!notes?.length) {
                speak('No notes available to open.');
                return;
            }

            console.log('title', title);

            const normalizedTitle = title.toLowerCase().trim();
            const matchingNote = notes.find((note) =>
                note.noteTitle?.toLowerCase().includes(normalizedTitle)
            );

            if (matchingNote) {
                openNote(matchingNote);
                speak(`Opening note: ${matchingNote.noteTitle || 'Untitled'}`);
            } else {
                speak(`Note with title "${title}" not found.`);
            }
        },
        isFuzzyMatch: false,
        matchInterim: false,
    },

    {
        command: ['delete note *', 'delete not *', 'delete the note *'],
        callback: (title: string) => {
            if (!title?.trim()) {
                speak('Please specify a note title to delete.');
                return;
            }

            if (!notes?.length) {
                speak('No notes available to delete.');
                return;
            }

            console.log('title', title);

            const normalizedTitle = title.toLowerCase().trim();
            const matchingNote = notes.find((note) =>
                note.noteTitle?.toLowerCase().includes(normalizedTitle)
            );

            if (matchingNote && matchingNote._id) {
                handlers.handleMoveToTrash(matchingNote._id);
                speak(
                    `Note "${
                        matchingNote.noteTitle || 'Untitled'
                    }" moved to trash.`
                );
            } else {
                speak(`Note with title "${title}" not found.`);
            }
        },
        isFuzzyMatch: false,
        matchInterim: false,
    },

    {
        command: [
            'archive note *',
            'archive *',
            'archive the note *',
            'toggle archive *',
            'toggle archive note',
        ],
        callback: (title: string) => {
            if (!title?.trim()) {
                speak('Please specify a note title to archive.');
                return;
            }

            if (!notes?.length) {
                speak('No notes available to archive.');
                return;
            }

            console.log('title', title);

            const normalizedTitle = title.toLowerCase().trim();
            const matchingNote = notes.find((note) =>
                note.noteTitle?.toLowerCase().includes(normalizedTitle)
            );

            if (matchingNote && matchingNote._id) {
                handlers.handleArchiveToggle(matchingNote._id);
                const action = matchingNote.archived
                    ? 'unarchived'
                    : 'archived';
                speak(
                    `Note "${matchingNote.noteTitle || 'Untitled'}" ${action}.`
                );
            } else {
                speak(`Note with title "${title}" not found.`);
            }
        },
        isFuzzyMatch: false,
        matchInterim: false,
    },

    {
        command: ['copy not *', 'clone not *', 'clone the note *'],
        callback: (title: string) => {
            if (!title?.trim()) {
                speak('Please specify a note title to clone.');
                return;
            }

            if (!notes?.length) {
                speak('No notes available to clone.');
                return;
            }

            console.log('title', title);

            const normalizedTitle = title.toLowerCase().trim();
            const matchingNote = notes.find((note) =>
                note.noteTitle?.toLowerCase().includes(normalizedTitle)
            );

            if (matchingNote && matchingNote._id) {
                handlers.handleCloneNote(matchingNote._id);
                speak(
                    `Note "${
                        matchingNote.noteTitle || 'Untitled'
                    }" cloned successfully.`
                );
            } else {
                speak(`Note with title "${title}" not found.`);
            }
        },
        isFuzzyMatch: false,
        matchInterim: false,
    },

    {
        command: ['pin the note *', 'pin not *', 'pin a note *'],
        callback: (title: string) => {
            if (!title?.trim()) {
                speak('Please specify a note title to pin.');
                return;
            }

            if (!notes?.length) {
                speak('No notes available to pin.');
                return;
            }

            console.log('title', title);

            const normalizedTitle = title.toLowerCase().trim();
            const matchingNote = notes.find((note) =>
                note.noteTitle?.toLowerCase().includes(normalizedTitle)
            );

            if (matchingNote && matchingNote._id) {
                handlers.handlePinToggle(matchingNote._id);
                const action = matchingNote.pinned ? 'unpinned' : 'pinned';
                speak(
                    `Note "${matchingNote.noteTitle || 'Untitled'}" ${action}.`
                );
            } else {
                speak(`Note with title "${title}" not found.`);
            }
        },
        isFuzzyMatch: false,
        matchInterim: false,
    },
];
