'use client';

import { NoteI } from '@/interfaces/notes';
import {
    useCreateNoteMutation,
    useGetUserNotesQuery,
    useMoveNoteToBinMutation,
    useUpdateNoteMutation,
} from '@/redux/api/notesAPI';
import { RootState } from '@/redux/store';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition';
import NoteCard from './NoteCard';
import '@/styles/components/notes/_noteCard.scss';

const NotesContainer = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const uid = user?.uid;

    // Refs for speech recognition
    const noteTitleRef = useRef<HTMLInputElement>(null);
    const noteBodyRef = useRef<HTMLTextAreaElement>(null);

    // API hooks
    const {
        data: notes = [],
        isLoading,
        isError,
        refetch,
    } = useGetUserNotesQuery();

    const [createNote] = useCreateNoteMutation();
    const [updateNote] = useUpdateNoteMutation();
    const [moveToBin] = useMoveNoteToBinMutation();

    // UI state
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [editingNote, setEditingNote] = useState<NoteI | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeField, setActiveField] = useState<'title' | 'body' | null>(
        null
    );

    // Speech recognition
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
        useSpeechRecognition();
    const [isListening, setIsListening] = useState(false);

    // Memoize categorized notes
    const { pinnedNotes, unpinnedNotes } = useMemo(() => {
        const active = notes.filter((n: NoteI) => !n.trashed && !n.archived);
        return {
            pinnedNotes: active.filter((n: NoteI) => n.pinned),
            unpinnedNotes: active.filter((n: NoteI) => !n.pinned),
        };
    }, [notes]);

    // Speech recognition handlers
    const startListening = () => {
        try {
            setIsListening(true);
            SpeechRecognition.startListening({
                continuous: true,
                language: 'en-IN',
            });
        } catch (error) {
            console.error('Speech recognition error:', error);
            setIsListening(false);
        }
    };

    const stopListening = () => {
        setIsListening(false);
        SpeechRecognition.stopListening();
    };

    // Update fields with speech input
    useEffect(() => {
        if (!isListening || !transcript || !activeField) return;

        if (activeField === 'title') {
            setEditingNote((prev) => ({
                ...prev!,
                noteTitle: transcript,
            }));
        } else if (activeField === 'body') {
            setEditingNote((prev) => ({
                ...prev!,
                noteBody: transcript,
            }));
        }

        console.log('Transcript:', transcript);
    }, [transcript, isListening, activeField]);

    // Note operations
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

    // Modal handlers
    const openNote = (note: NoteI) => {
        setEditingNote(note);
        setIsModalOpen(true);
        resetTranscript();
    };

    const closeModal = () => {
        setEditingNote(null);
        setIsModalOpen(false);
        if (isListening) stopListening();
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

    if (!browserSupportsSpeechRecognition) {
        return (
            <div className='browser-warning'>
                Your browser doesn&apos;t support speech recognition. Please try
                Chrome or Edge.
            </div>
        );
    }

    if (isLoading) return <div className='loading'>Loading notes...</div>;
    if (isError) return <div className='error'>Error loading notes</div>;

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

                        <div className='speech-controls'>
                            <button
                                onClick={
                                    isListening ? stopListening : startListening
                                }
                                aria-label={
                                    isListening
                                        ? 'Stop speech recognition'
                                        : 'Start speech recognition'
                                }
                            >
                                {isListening ? '🛑 Stop' : '🎤 Start Speaking'}
                            </button>
                            <button onClick={resetTranscript}>🗑️ Clear</button>
                            {isListening && (
                                <span className='listening-indicator'>
                                    🎙️ Listening...
                                </span>
                            )}
                        </div>

                        <input
                            ref={noteTitleRef}
                            className='modal-input'
                            value={editingNote.noteTitle || ''}
                            onChange={(e) =>
                                setEditingNote({
                                    ...editingNote,
                                    noteTitle: e.target.value,
                                })
                            }
                            onFocus={() => {
                                setActiveField('title');
                                resetTranscript();
                            }}
                            placeholder='Title'
                        />

                        <textarea
                            ref={noteBodyRef}
                            className='modal-textarea'
                            value={editingNote.noteBody || ''}
                            onChange={(e) =>
                                setEditingNote({
                                    ...editingNote,
                                    noteBody: e.target.value,
                                })
                            }
                            onFocus={() => {
                                setActiveField('body');
                                resetTranscript();
                            }}
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
