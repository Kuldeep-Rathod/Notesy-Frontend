'use client';

import { useParams } from 'next/navigation';
import NoteCard from '@/components/notes/NoteCard';
import { NoteI } from '@/interfaces/notes';
import '@/styles/components/notes/_noteCard.scss';
import { useGetUserNotesQuery } from '@/redux/api/notesAPI';

const LabelNotesPage: React.FC = () => {
    const { slug } = useParams();
    const { data: notes = [], isLoading, isError } = useGetUserNotesQuery();

    // Filter notes that contain this label slug
    const filteredNotes = notes.filter((note: NoteI) =>
        note.labels?.some((label) => label === slug)
    );

    if (isLoading)
        return <div className='loading'>Loading notes for {slug}...</div>;
    if (isError) return <div className='error'>Error loading notes</div>;

    return (
        <div className='notes-container'>
            <h1 className='page-title'>Notes with label: {slug}</h1>
            {filteredNotes.length === 0 ? (
                <p className='empty-message'>No notes found with this label</p>
            ) : (
                <div className='notes-list grid'>
                    {filteredNotes.map((note: NoteI) => (
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

export default LabelNotesPage;
