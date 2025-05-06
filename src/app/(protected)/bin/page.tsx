'use client';

import NoteCard from '@/components/notes/NoteCard';
import { NoteI } from '@/interfaces/notes';
import {
    useDeleteNoteMutation,
    useGetTrashedNotesQuery,
    useRestoreNoteMutation,
} from '@/redux/api/notesAPI';
import '@/styles/components/_noteCard.scss';

const BinNotesPage = () => {
    const {
        data: notes = [],
        isLoading,
        isError,
        refetch,
    } = useGetTrashedNotesQuery();

    const [restoreNote] = useRestoreNoteMutation();
    const [deleteNote] = useDeleteNoteMutation();

    const handleRestore = async (id: string) => {
        try {
            await restoreNote(id).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to restore note:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNote(id).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    if (isLoading)
        return <div className='loading'>Loading deleted notes...</div>;
    if (isError)
        return <div className='error'>Error loading deleted notes</div>;

    return (
        <div className='notes-container'>
            <h1 className='page-title'>Bin</h1>
            {notes.length === 0 ? (
                <p className='empty-message'>No notes in bin</p>
            ) : (
                <div className='notes-list grid'>
                    {notes.map((note: NoteI) => (
                        <NoteCard
                            key={note._id}
                            note={note}
                            onRestore={() => handleRestore(note._id!)}
                            onDelete={() => handleDelete(note._id!)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BinNotesPage;
