'use client';

import { useGetAllNotesQuery } from '@/redux/api/notesAPI';
import { RootState } from '@/redux/store';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import '@/styles/components/_noteCard.scss';
import NoteCard from './NoteCard';

interface Note {
    id: number;
    noteTitle: string;
    noteBody: string;
    pinned: boolean;
    archived: boolean;
    trashed: boolean;
    color?: string;
    labels?: string[];
}

const DummyNotes = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const uid = user?.uid!;

    const {
        data: notes = [],
        isLoading,
        isError,
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    } = useGetAllNotesQuery(user?.uid!, {
        skip: !uid,
    });

    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [localNotes, setLocalNotes] = useState<any[]>(notes);

    // Filter notes to show only those that are not trashed and not archived
    const activeNotes = localNotes.filter(
        (note) => !note.trashed && !note.archived
    );

    // Separate pinned notes
    const pinnedNotes = activeNotes.filter((note) => note.pinned);
    const unpinnedNotes = activeNotes.filter((note) => !note.pinned);
    const archivedNotes = localNotes.filter(
        (note) => note.archived && !note.trashed
    );
    const trashedNotes = localNotes.filter((note) => note.trashed);

    const togglePin = (id: number) => {
        setLocalNotes(
            localNotes.map((note) =>
                note.id === id ? { ...note, pinned: !note.pinned } : note
            )
        );
    };

    const toggleArchive = (id: number) => {
        setLocalNotes(
            localNotes.map((note) =>
                note.id === id
                    ? { ...note, archived: !note.archived, pinned: false }
                    : note
            )
        );
    };

    const moveToTrash = (id: number) => {
        setLocalNotes(
            localNotes.map((note) =>
                note.id === id
                    ? { ...note, trashed: true, pinned: false, archived: false }
                    : note
            )
        );
    };

    const restoreNote = (id: number) => {
        setLocalNotes(
            localNotes.map((note) =>
                note.id === id ? { ...note, trashed: false } : note
            )
        );
    };

    const deleteNote = (id: number) => {
        setLocalNotes(localNotes.filter((note) => note.id !== id));
    };

    const cloneNote = (id: number) => {
        const noteToClone = localNotes.find((note) => note.id === id);
        if (noteToClone) {
            const newNote = {
                ...noteToClone,
                id: Math.max(...localNotes.map((n) => n.id)) + 1,
                pinned: false,
            };
            setLocalNotes([...localNotes, newNote]);
        }
    };

    const changeColor = (id: number, color: string) => {
        setLocalNotes(
            localNotes.map((note) =>
                note.id === id ? { ...note, color } : note
            )
        );
    };

    const openNote = (note: Note) => {
        setEditingNote(note);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingNote(null);
    };

    const saveNote = () => {
        if (editingNote) {
            setLocalNotes(
                localNotes.map((note) =>
                    note.id === editingNote.id ? editingNote : note
                )
            );
            closeModal();
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading notes</div>;

    return (
        <div className='notes-container'>
            <div className='notes-actions'>
                <button
                    className={`view-toggle ${
                        viewType === 'grid' ? 'active' : ''
                    }`}
                    onClick={() => setViewType('grid')}
                >
                    Grid View
                </button>
                <button
                    className={`view-toggle ${
                        viewType === 'list' ? 'active' : ''
                    }`}
                    onClick={() => setViewType('list')}
                >
                    List View
                </button>
            </div>

            {pinnedNotes.length > 0 && (
                <div className='notes-section'>
                    <h3 className='section-title'>Pinned Notes</h3>
                    <div className={`notes-list ${viewType}`}>
                        {pinnedNotes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onPinToggle={togglePin}
                                onArchiveToggle={toggleArchive}
                                onTrash={moveToTrash}
                                onEdit={openNote}
                                onChangeColor={changeColor}
                                onClone={cloneNote}
                            />
                        ))}
                    </div>
                </div>
            )}

            {unpinnedNotes.length > 0 && (
                <div className='notes-section'>
                    <h3 className='section-title'>Notes</h3>
                    <div className={`notes-list ${viewType}`}>
                        {unpinnedNotes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onPinToggle={togglePin}
                                onArchiveToggle={toggleArchive}
                                onTrash={moveToTrash}
                                onEdit={openNote}
                                onChangeColor={changeColor}
                                onClone={cloneNote}
                            />
                        ))}
                    </div>
                </div>
            )}

            {isModalOpen && editingNote && (
                <div
                    className='modal-overlay'
                    onClick={closeModal}
                >
                    <div
                        className='modal-content'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Edit Note</h2>
                        <input
                            className='modal-input'
                            value={editingNote.noteTitle}
                            onChange={(e) =>
                                setEditingNote({
                                    ...editingNote,
                                    noteTitle: e.target.value,
                                })
                            }
                            placeholder='Title'
                        />
                        <textarea
                            className='modal-textarea'
                            value={editingNote.noteBody}
                            onChange={(e) =>
                                setEditingNote({
                                    ...editingNote,
                                    noteBody: e.target.value,
                                })
                            }
                            placeholder='Take a note...'
                            rows={8}
                        />
                        <div className='modal-actions'>
                            <button
                                className='modal-button save'
                                onClick={saveNote}
                            >
                                Save
                            </button>
                            <button
                                className='modal-button cancel'
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DummyNotes;
