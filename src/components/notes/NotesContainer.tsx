'use client';

import { NoteI } from '@/interfaces/notes';
import {
    useCreateNoteMutation,
    useGetUserNotesQuery,
    useMoveNoteToBinMutation,
    useUpdateNoteMutation,
} from '@/redux/api/notesAPI';
import { RootState } from '@/redux/store';
import '@/styles/components/notes/_noteContainer.scss';
import { X as CloseIcon, Grid, List, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import NoteCard from './NoteCard';
import NoteInput from './NoteInput';

interface NotesContainerProps {
    initialViewType?: 'grid' | 'list';
    initialSearchQuery?: string;
    filterType?: 'reminder' | 'label' | 'archive' | 'trash';
    filterValue?: string;
    onViewTypeChange?: (viewType: 'grid' | 'list') => void;
    onSearchQueryChange?: (query: string) => void;
}

const NotesContainer = ({
    initialViewType = 'grid',
    initialSearchQuery = '',
    filterType,
    filterValue,
    onViewTypeChange,
    onSearchQueryChange,
}: NotesContainerProps = {}) => {
    const user = useSelector((state: RootState) => state.auth.user);
    const uid = user?.uid;

    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);

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
    const [viewType, setViewType] = useState<'grid' | 'list'>(initialViewType);
    const [editingNote, setEditingNote] = useState<NoteI | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

    // When the props change, update the state
    useEffect(() => {
        setViewType(initialViewType);
    }, [initialViewType]);

    useEffect(() => {
        setSearchQuery(initialSearchQuery);
    }, [initialSearchQuery]);

    // When the state changes, notify the parent
    const handleViewTypeChange = (newViewType: 'grid' | 'list') => {
        setViewType(newViewType);
        onViewTypeChange?.(newViewType);
    };

    const handleSearchQueryChange = (newQuery: string) => {
        setSearchQuery(newQuery);
        onSearchQueryChange?.(newQuery);
    };

    const {
        pinnedNotes,
        unpinnedNotes,
        trashedNotes,
        archivedNotes,
        filteredNotes,
    } = useMemo(() => {
        let filtered = notes;

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter((note: NoteI) => {
                const titleMatch = note.noteTitle
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase());
                const bodyMatch = note.noteBody
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase());
                const labelMatch = note.labels?.some(
                    (label) =>
                        typeof label === 'string' &&
                        label.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return titleMatch || bodyMatch || labelMatch;
            });
        }

        // Apply filterType
        switch (filterType) {
            case 'reminder':
                filtered = filtered.filter(
                    (note: NoteI) => !!note.reminder && !note.trashed
                );
                break;
            case 'label':
                filtered = filtered.filter((note: NoteI) =>
                    note.labels?.some((label) => label === filterValue)
                );
                break;
            case 'archive':
                filtered = filtered.filter(
                    (note: NoteI) => note.archived && !note.trashed
                );
                break;
            case 'trash':
                filtered = filtered.filter((note: NoteI) => note.trashed);
                break;
            default:
                filtered = filtered.filter(
                    (note: NoteI) => !note.archived && !note.trashed
                );
                break;
        }

        return {
            pinnedNotes: filtered.filter((n: NoteI) => n.pinned),
            unpinnedNotes: filtered.filter((n: NoteI) => !n.pinned),
            trashedNotes: filtered.filter((n: NoteI) => n.trashed),
            archivedNotes: filtered.filter(
                (n: NoteI) => n.archived && !n.trashed
            ),
            filteredNotes: filtered,
        };
    }, [notes, searchQuery, filterType, filterValue]);

    // Note operations
    const handlePinToggle = async (noteId: string) => {
        const note = notes.find((n: NoteI) => n._id === noteId);
        if (!note) return;

        try {
            await updateNote({
                id: noteId,
                updates: { pinned: !note.pinned },
            }).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to update note:', error);
        }
    };

    const handleArchiveToggle = async (noteId: string) => {
        const note = notes.find((n: NoteI) => n._id === noteId);
        if (!note) return;

        try {
            await updateNote({
                id: noteId,
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

    const handleMoveToTrash = async (noteId: string) => {
        try {
            await moveToBin(noteId).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to move note to trash:', error);
        }
    };

    const handleRestoreFromTrash = async (noteId: string) => {
        // try {
        //     await restoreFromBin(noteId).unwrap();
        //     refetch();
        // } catch (error) {
        //     console.error('Failed to restore note:', error);
        // }
    };

    const handleDeletePermanently = async (noteId: string) => {
        // try {
        //     await deleteNotePermanently(noteId).unwrap();
        //     refetch();
        // } catch (error) {
        //     console.error('Failed to delete note permanently:', error);
        // }
    };

    const handleChangeColor = async (noteId: string, color: string) => {
        try {
            await updateNote({
                id: noteId,
                updates: { bgColor: color },
            }).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to change note color:', error);
        }
    };

    const handleCloneNote = async (noteId: string) => {
        const note = notes.find((n: NoteI) => n._id === noteId);
        if (!note) return;

        try {
            const { _id, ...noteData } = note;
            await createNote({
                ...noteData,
                firebaseUid: uid!,
                pinned: false,
                noteTitle: `${note.noteTitle} (Copy)`,
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
        setSearchQuery('');
    };

    const closeModal = () => {
        setEditingNote(null);
        setIsModalOpen(false);
    };

    const saveNote = async () => {
        if (!editingNote) return;

        try {
            if (editingNote._id) {
                await updateNote({
                    id: editingNote._id,
                    updates: {
                        noteTitle: editingNote.noteTitle,
                        noteBody: editingNote.noteBody,
                        checklists: editingNote.checklists,
                        labels: editingNote.labels,
                        bgColor: editingNote.bgColor,
                        bgImage: editingNote.bgImage,
                    },
                }).unwrap();
            }
            refetch();
            closeModal();
        } catch (error) {
            console.error('Failed to save note:', error);
        }
    };

    const clearSearch = () => {
        handleSearchQueryChange('');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    return (
        <div className='notes-container'>
            {/* Header with search and view toggle */}
            <div className='notes-header'>
                <div className='search-container'>
                    <Search
                        size={18}
                        className='search-icon'
                    />
                    <input
                        ref={searchInputRef}
                        type='text'
                        placeholder='Search notes...'
                        value={searchQuery}
                        onChange={(e) =>
                            handleSearchQueryChange(e.target.value)
                        }
                        className='search-input'
                    />
                    {searchQuery && (
                        <button
                            className='clear-search'
                            onClick={clearSearch}
                            aria-label='Clear search'
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                <div className='view-options'>
                    <button
                        className={`view-toggle ${
                            viewType === 'grid' ? 'active' : ''
                        }`}
                        onClick={() => handleViewTypeChange('grid')}
                        aria-label='Grid view'
                    >
                        <Grid size={20} />
                    </button>
                    <button
                        className={`view-toggle ${
                            viewType === 'list' ? 'active' : ''
                        }`}
                        onClick={() => handleViewTypeChange('list')}
                        aria-label='List view'
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            {/* Notes sections */}
            {isLoading ? (
                <div className='loading-container'>
                    <div className='loading-spinner'></div>
                    <p>Loading notes...</p>
                </div>
            ) : isError ? (
                <div className='error-container'>
                    <p>Error loading notes. Please try again later.</p>
                    <button
                        onClick={() => refetch()}
                        className='retry-button'
                    >
                        Retry
                    </button>
                </div>
            ) : filteredNotes.length === 0 ? (
                <div className='empty-state'>
                    <p>
                        No notes found
                        {searchQuery ? ' matching your search' : ''}
                    </p>
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className='clear-search-button'
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {pinnedNotes.length > 0 && (
                        <section className='notes-section'>
                            <h3 className='section-title'>
                                <span>Pinned Notes</span>
                                <span className='note-count'>
                                    {pinnedNotes.length}
                                </span>
                            </h3>
                            <div className={`notes-list ${viewType}`}>
                                {pinnedNotes.map((note: NoteI) => (
                                    <NoteCard
                                        key={note._id}
                                        note={note}
                                        onPinToggle={handlePinToggle}
                                        onArchiveToggle={handleArchiveToggle}
                                        onTrash={handleMoveToTrash}
                                        onEdit={openNote}
                                        onChangeColor={handleChangeColor}
                                        onClone={handleCloneNote}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {unpinnedNotes.length > 0 && (
                        <section className='notes-section'>
                            <h3 className='section-title'>
                                <span>Notes</span>
                                <span className='note-count'>
                                    {unpinnedNotes.length}
                                </span>
                            </h3>
                            <div className={`notes-list ${viewType}`}>
                                {unpinnedNotes.map((note: NoteI) => (
                                    <NoteCard
                                        key={note._id}
                                        note={note}
                                        onPinToggle={handlePinToggle}
                                        onArchiveToggle={handleArchiveToggle}
                                        onTrash={handleMoveToTrash}
                                        onEdit={openNote}
                                        onChangeColor={handleChangeColor}
                                        onClone={handleCloneNote}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {archivedNotes.length > 0 && searchQuery && (
                        <section className='notes-section'>
                            <h3 className='section-title'>
                                <span>Archived Notes</span>
                                <span className='note-count'>
                                    {archivedNotes.length}
                                </span>
                            </h3>
                            <div className={`notes-list ${viewType}`}>
                                {archivedNotes.map((note: NoteI) => (
                                    <NoteCard
                                        key={note._id}
                                        note={note}
                                        onPinToggle={handlePinToggle}
                                        onArchiveToggle={handleArchiveToggle}
                                        onTrash={handleMoveToTrash}
                                        onEdit={openNote}
                                        onChangeColor={handleChangeColor}
                                        onClone={handleCloneNote}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {trashedNotes.length > 0 && searchQuery && (
                        <section className='notes-section'>
                            <h3 className='section-title'>
                                <span>Trash</span>
                                <span className='note-count'>
                                    {trashedNotes.length}
                                </span>
                            </h3>
                            <div className={`notes-list ${viewType}`}>
                                {trashedNotes.map((note: NoteI) => (
                                    <NoteCard
                                        key={note._id}
                                        note={note}
                                        onRestore={handleRestoreFromTrash}
                                        onDelete={handleDeletePermanently}
                                        onEdit={openNote}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}

            {/* Note edit/create modal */}
            {isModalOpen && editingNote && (
                <div
                    className='modal-overlay'
                    onClick={closeModal}
                >
                    <div
                        className='modal-content'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='modal-header'>
                            <h2>Edit Note</h2>
                            <button
                                className='close-modal'
                                onClick={closeModal}
                                aria-label='Close modal'
                            >
                                <CloseIcon size={20} />
                            </button>
                        </div>

                        <div className='modal-body'>
                            <NoteInput
                                isEditing={true}
                                noteToEdit={{
                                    _id: editingNote._id,
                                    noteTitle: editingNote.noteTitle || '',
                                    noteBody: editingNote.noteBody || '',
                                    isCbox: editingNote.checklists
                                        ? editingNote.checklists.length > 0
                                        : false,
                                    checklists: editingNote.checklists || [],
                                    pinned: editingNote.pinned || false,
                                    archived: editingNote.archived || false,
                                    trashed: editingNote.trashed || false,
                                    bgColor: editingNote.bgColor || '#ffffff',
                                    bgImage: editingNote.bgImage || '',
                                    labels: editingNote.labels || [],
                                    reminder: editingNote.reminder,
                                }}
                                onSuccess={() => {
                                    closeModal();
                                    refetch();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotesContainer;
