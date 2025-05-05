'use client';

import '@/styles/components/_noteCard.scss';
import { NoteI } from '@/interfaces/notes';
import NoteCard from '@/components/notes/NoteCard';
import { useGetArchivedNotesQuery } from '@/redux/api/notesAPI';

const ArchivedNotesPage = () => {
    const { data: notes = [], isLoading, isError } = useGetArchivedNotesQuery();

    if (isLoading)
        return <div className='loading'>Loading archived notes...</div>;
    if (isError)
        return <div className='error'>Error loading archived notes</div>;

    return (
        <div className='notes-container'>
            <h1 className='page-title'>Archived Notes</h1>
            {notes.length === 0 ? (
                <p className='empty-message'>No archived notes found</p>
            ) : (
                <div className='notes-list grid'>
                    {notes.map((note: NoteI) => (
                        <NoteCard
                            key={note._id}
                            note={note}
                            onArchiveToggle={() => {}}
                            onTrash={() => {}}
                            onEdit={() => {}}
                            onChangeColor={() => {}}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ArchivedNotesPage;
