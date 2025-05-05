'use client';

import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetUserNotesQuery,
    useCreateNoteMutation,
    useUpdateNoteMutation,
    useMoveNoteToBinMutation,
} from '@/redux/api/notesAPI';
import { RootState } from '@/redux/store';
import '@/styles/components/_noteCard.scss';
import NoteCard from './NoteCard';
import { NoteI } from '@/interfaces/notes';

const NotesContainer = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const uid = user?.uid;

    // API hooks
    const {
        data: notes = [],
        isLoading,
        isError,
        refetch,
    } = useGetUserNotesQuery(uid!, {
        skip: !uid,
    });

    const [createNote] = useCreateNoteMutation();
    const [updateNote] = useUpdateNoteMutation();
    const [moveToBin] = useMoveNoteToBinMutation();

    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [editingNote, setEditingNote] = useState<NoteI | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Memoize categorized notes with proper typing
    const { pinnedNotes, unpinnedNotes } = useMemo(() => {
        const active = notes.filter((n: NoteI) => !n.trashed && !n.archived);
        return {
            pinnedNotes: active.filter((n: NoteI) => n.pinned),
            unpinnedNotes: active.filter((n: NoteI) => !n.pinned),
        };
    }, [notes]);

    // API operations with proper typing
    const handlePinToggle = async (note: NoteI) => {
        try {
            await updateNote({
                id: note._id!,
                updates: { pinned: !note.pinned },
            }).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to update note:', error);
        }
    };

    const handleArchiveToggle = async (note: NoteI) => {
        try {
            await updateNote({
                id: note._id!,
                updates: {
                    archived: !note.archived,
                    pinned: false,
                },
            }).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to archive note:', error);
        }
    };

    const handleMoveToTrash = async (note: NoteI) => {
        try {
            await moveToBin(note._id!).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to move note to trash:', error);
        }
    };

    const handleChangeColor = async (note: NoteI, color: string) => {
        try {
            await updateNote({
                id: note._id!,
                updates: { bgColor: color },
            }).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to change note color:', error);
        }
    };

    const handleCloneNote = async (note: NoteI) => {
        try {
            const { _id, ...noteData } = note;
            await createNote({
                ...noteData,
                firebaseUid: uid!,
                pinned: false,
            }).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to clone note:', error);
        }
    };

    const openNote = (note: NoteI) => {
        setEditingNote(note);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingNote(null);
        setIsModalOpen(false);
    };

    const saveNote = async () => {
        if (editingNote && editingNote._id) {
            try {
                await updateNote({
                    id: editingNote._id,
                    updates: {
                        noteTitle: editingNote.noteTitle,
                        noteBody: editingNote.noteBody,
                        isCbox: editingNote.isCbox,
                        checklists: editingNote.checklists,
                        labels: editingNote.labels,
                        bgColor: editingNote.bgColor,
                        bgImage: editingNote.bgImage,
                    },
                }).unwrap();
                refetch();
                closeModal();
            } catch (error) {
                console.error('Failed to update note:', error);
            }
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading notes</div>;

    return (
        <div className='notes-container'>
            <div className='notes-actions'>
                {(['grid', 'list'] as const).map((type) => (
                    <button
                        key={type}
                        className={`view-toggle ${
                            viewType === type ? 'active' : ''
                        }`}
                        onClick={() => setViewType(type)}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)} View
                    </button>
                ))}
            </div>

            {pinnedNotes.length > 0 && (
                <section className='notes-section'>
                    <h3 className='section-title'>Pinned Notes</h3>
                    <div className={`notes-list ${viewType}`}>
                        {pinnedNotes.map((note: NoteI) => (
                            <NoteCard
                                key={note._id}
                                note={note}
                                onPinToggle={() => handlePinToggle(note)}
                                onArchiveToggle={() =>
                                    handleArchiveToggle(note)
                                }
                                onTrash={() => handleMoveToTrash(note)}
                                onEdit={() => openNote(note)}
                                onChangeColor={(color: string) =>
                                    handleChangeColor(note, color)
                                }
                                onClone={() => handleCloneNote(note)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {unpinnedNotes.length > 0 && (
                <section className='notes-section'>
                    <h3 className='section-title'>Notes</h3>
                    <div className={`notes-list ${viewType}`}>
                        {unpinnedNotes.map((note: NoteI) => (
                            <NoteCard
                                key={note._id}
                                note={note}
                                onPinToggle={() => handlePinToggle(note)}
                                onArchiveToggle={() =>
                                    handleArchiveToggle(note)
                                }
                                onTrash={() => handleMoveToTrash(note)}
                                onEdit={() => openNote(note)}
                                onChangeColor={(color: string) =>
                                    handleChangeColor(note, color)
                                }
                                onClone={() => handleCloneNote(note)}
                            />
                        ))}
                    </div>
                </section>
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
                            value={editingNote.noteTitle || ''}
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
                            value={editingNote.noteBody || ''}
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

export default NotesContainer;
