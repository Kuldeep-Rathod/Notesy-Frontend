import { NoteI } from '@/interfaces/notes';

interface TrashedNotesCommandsParams {
    handlers: {
        handleRestoreFromTrash: (noteId: string) => void;
        handleDeletePermanently: (noteId: string) => void;
    };
    notes: NoteI[];
}

export const useTrashedNotesCommands = ({
    handlers,
    notes,
}: TrashedNotesCommandsParams) => [
    {
        command: [
            'restore note *',
            'restore *',
            'bring back note *',
            'bring back *',
            'recover note *',
            'recover *',
            'move note * back',
            'move * back',
            'put back note *',
            'put back *',
        ],
        callback: (title: string) => {
            if (!title?.trim() || !notes?.length) return;

            console.log('title', title);

            const normalizedTitle = title.toLowerCase().trim();
            const matchingNote = notes.find((note) =>
                note.noteTitle?.toLowerCase().includes(normalizedTitle)
            );

            if (matchingNote && matchingNote._id) {
                handlers.handleRestoreFromTrash(matchingNote._id);
            }
        },
        isFuzzyMatch: false,
        matchInterim: true,
    },
    {
        command: [
            'delete forever note *',
            'delete forever *',
            'permanently delete note *',
            'permanently delete *',
        ],
        callback: (title: string) => {
            if (!title?.trim() || !notes?.length) return;

            console.log('title', title);

            const normalizedTitle = title.toLowerCase().trim();
            const matchingNote = notes.find((note) =>
                note.noteTitle?.toLowerCase().includes(normalizedTitle)
            );

            if (matchingNote && matchingNote._id) {
                handlers.handleDeletePermanently(matchingNote._id);
            }
        },
        isFuzzyMatch: false,
        matchInterim: true,
    },
];
