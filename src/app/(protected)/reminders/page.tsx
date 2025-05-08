'use client';

import NoteCard from '@/components/notes/NoteCard';
import { NoteI } from '@/interfaces/notes';
import '@/styles/components/notes/_noteCard.scss';
import { useGetUserNotesQuery } from '@/redux/api/notesAPI';

const ReminderNotesPage: React.FC = () => {
    const { data: notes = [], isLoading, isError } = useGetUserNotesQuery();

    // Filter notes that have a valid reminder
    const filteredNotes = notes.filter((note: NoteI) => note.reminder);

    if (isLoading)
        return <div className='loading'>Loading reminder notes...</div>;
    if (isError) return <div className='error'>Error loading notes</div>;

    return (
        <div className='notes-container'>
            <h1 className='page-title'>Reminder Notes</h1>
            {filteredNotes.length === 0 ? (
                <p className='empty-message'>No notes with reminders found</p>
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

export default ReminderNotesPage;
