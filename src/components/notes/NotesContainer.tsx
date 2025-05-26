'use client';

import { NoteI } from '@/interfaces/notes';
import {
    useCreateNoteMutation,
    useDeleteNoteMutation,
    useDeleteSingleImageMutation,
    useGetUserNotesQuery,
    useMoveNoteToBinMutation,
    useRestoreNoteMutation,
    useUpdateNoteMutation,
} from '@/redux/api/notesAPI';
import {
    resetNoteInput,
    selectNoteInput,
} from '@/redux/reducer/noteInputReducer';
import { RootState } from '@/redux/store';
import { getNotesContainerCommands } from '@/voice-assistant/commands/notesContainerCommands';
import { useTrashedNotesCommands } from '@/voice-assistant/commands/trashPageCommands';
import usePageVoiceCommands from '@/voice-assistant/hooks/usePageVoiceCommands';
import { Masonry } from '@mui/lab';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Bell,
    X as CloseIcon,
    Grid,
    List,
    Search,
    Users,
    X,
} from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { ImagePreview, ImagePreviewModal } from './input/ImagePreview';
import NoteCard from './NoteCard';
import NoteInput from './NoteInput';

interface NotesContainerProps {
    initialViewType?: 'grid' | 'list';
    initialSearchQuery?: string;
    filterType?: string;
    filterValue?: string;
    onViewTypeChange?: (viewType: 'grid' | 'list') => void;
    onSearchQueryChange?: (query: string) => void;
    onModalStateChange?: (isOpen: boolean) => void;
}

const NotesContainer = ({
    initialViewType = 'grid',
    initialSearchQuery = '',
    filterType,
    filterValue,
    onViewTypeChange,
    onSearchQueryChange,
    onModalStateChange,
}: NotesContainerProps = {}) => {
    const dispatch = useDispatch();

    const { labels } = useSelector(selectNoteInput);
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
    const [restoreNote] = useRestoreNoteMutation();
    const [deleteNote] = useDeleteNoteMutation();
    const [deleteSingleImage, { isLoading: isImageDeleting }] =
        useDeleteSingleImageMutation();

    // UI state
    const [viewType, setViewType] = useState<'grid' | 'list'>(initialViewType);
    const [editingNote, setEditingNote] = useState<NoteI | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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
        // Apply filterType
        switch (filterType) {
            case 'reminder':
                filtered = filtered.filter(
                    (note: NoteI) =>
                        !!note.reminder && !note.trashed && !note.archived
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
            case `${filterType}`:
                filtered = filtered.filter((note: NoteI) =>
                    note.labels?.some((label) => label === filterType)
                );
                break;
            default: // Default view (non-archived, non-trashed notes)
                filtered = filtered.filter(
                    (note: NoteI) => !note.archived && !note.trashed
                );
                break;
        }

        return {
            pinnedNotes: filtered.filter((n: NoteI) => n.pinned && !n.trashed),
            unpinnedNotes: filtered.filter(
                (n: NoteI) => !n.pinned && !n.trashed
            ),
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
            toast.success(note.pinned ? 'Note unpinned' : 'Note pinned');
        } catch (error) {
            console.error('Failed to update note:', error);
            toast.error('Failed to update note');
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
            toast.success(note.archived ? 'Note unarchived' : 'Note archived');
        } catch (error) {
            console.error('Failed to archive note:', error);
            toast.error('Failed to archive note');
        }
    };

    const handleMoveToTrash = async (noteId: string) => {
        try {
            await moveToBin(noteId).unwrap();
            refetch();
            toast.success('Note moved to trash');
        } catch (error) {
            console.error('Failed to move note to trash:', error);
            toast.error('Failed to move note to trash');
        }
    };

    const handleRestoreFromTrash = async (noteId: string) => {
        try {
            console.log('Restoring note:', noteId);
            await restoreNote(noteId).unwrap();
            refetch();
            toast.success('Note restored from trash');
        } catch (error) {
            console.error('Failed to restore note:', error);
            toast.error('Failed to restore note');
        }
    };

    const handleDeletePermanently = async (noteId: string) => {
        try {
            await deleteNote(noteId).unwrap();
            refetch();
            toast.success('Note permanently deleted');
        } catch (error) {
            console.error('Failed to delete note permanently:', error);
            toast.error('Failed to delete note');
        }
    };

    const handleChangeColor = async (noteId: string, color: string) => {
        try {
            await updateNote({
                id: noteId,
                updates: { bgColor: color },
            }).unwrap();
            refetch();
            toast.success('Note color updated');
        } catch (error) {
            console.error('Failed to change note color:', error);
            toast.error('Failed to change note color');
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
            toast.success('Note cloned successfully');
        } catch (error) {
            console.error('Failed to clone note:', error);
            toast.error('Failed to clone note');
        }
    };

    // Modal handlers
    const openNote = (note: NoteI) => {
        setEditingNote(note);
        setIsModalOpen(true);
        setSearchQuery('');
        onModalStateChange?.(true);
    };

    const closeModal = () => {
        setEditingNote(null);
        setIsModalOpen(false);
        onModalStateChange?.(false);
        dispatch(resetNoteInput());
    };

    // Add event listener for Escape key to close modal
    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (isModalOpen && e.key === 'Escape') {
                closeModal();
            }
        };

        window.addEventListener('keydown', handleEscapeKey);

        return () => {
            window.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isModalOpen]);

    // Calculate modal background styles
    const getModalStyle = useMemo(() => {
        if (!editingNote) return {};

        const style: React.CSSProperties = {};

        if (editingNote.bgImage) {
            style.backgroundImage = editingNote.bgImage;
            style.backgroundSize = 'cover';
            style.backgroundPosition = 'center';
        } else if (editingNote.bgColor) {
            style.backgroundColor = editingNote.bgColor;
        }

        return style;
    }, [editingNote]);

    // Format date for display
    const formatReminderDate = (
        dateString: string | Date | null | undefined
    ) => {
        if (!dateString) return null;
        try {
            const date =
                typeof dateString === 'string'
                    ? parseISO(dateString)
                    : new Date(dateString);

            if (isToday(date)) {
                return `Today at ${format(date, 'h:mm a')}`;
            } else if (isTomorrow(date)) {
                return `Tomorrow at ${format(date, 'h:mm a')}`;
            } else {
                return format(date, "MMM d, yyyy 'at' h:mm a");
            }
        } catch (error) {
            console.error('Error formatting date:', error);
            return null;
        }
    };

    // Generate initials for avatars
    const getInitials = (email: string) => {
        if (!email) return '?';
        return email.charAt(0).toUpperCase();
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

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: 'beforeChildren',
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 24 },
        },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', damping: 25, stiffness: 300 },
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            transition: { duration: 0.2 },
        },
    };

    const pathname = usePathname();
    const path = pathname.slice(1);

    const isLabelRoute = labels.some((label) => label.name === path);

    const notesContainerCommands = getNotesContainerCommands({
        refs: { searchInputRef },
        setters: {
            setSearchQuery: handleSearchQueryChange,
            setViewType: handleViewTypeChange,
        },
        handlers: {
            handleMoveToTrash,
            handleArchiveToggle,
            handleCloneNote,
            handlePinToggle,
            closeModal,
        },
        notes: filteredNotes,
        openNote,
    });

    const trashPageCommands = useTrashedNotesCommands({
        handlers: {
            handleRestoreFromTrash,
            handleDeletePermanently,
        },
        notes: filteredNotes,
    });

    const {} = usePageVoiceCommands(
        {
            '/dashboard': notesContainerCommands,
            '/archive': notesContainerCommands,
            '/reminders': notesContainerCommands,
            '/trash': trashPageCommands,
            ...(isLabelRoute ? { [pathname]: notesContainerCommands } : {}),
        },
        { debug: true, requireWakeWord: true }
    );

    return (
        <div className='w-full max-w-7xl mx-auto px-4 py-6'>
            {/* Header with search and view toggle */}
            <div className='flex items-center justify-between mb-6 gap-4'>
                <div className='relative flex-grow max-w-2xl'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <Search
                            size={18}
                            className='text-gray-400'
                        />
                    </div>
                    <input
                        ref={searchInputRef}
                        type='text'
                        placeholder='Search notes...'
                        value={searchQuery}
                        onChange={(e) =>
                            handleSearchQueryChange(e.target.value)
                        }
                        className='w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200'
                    />
                    {searchQuery && (
                        <button
                            className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200'
                            onClick={clearSearch}
                            aria-label='Clear search'
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                <div className='flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg'>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-md transition-all duration-200 ${
                            viewType === 'grid'
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => handleViewTypeChange('grid')}
                        aria-label='Grid view'
                    >
                        <Grid size={20} />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-md transition-all duration-200 ${
                            viewType === 'list'
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => handleViewTypeChange('list')}
                        aria-label='List view'
                    >
                        <List size={20} />
                    </motion.button>
                </div>
            </div>

            {/* Notes sections */}
            {isLoading ? (
                <motion.div
                    className='flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className='w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin mb-4'></div>
                    <p className='text-lg font-medium'>Loading notes...</p>
                </motion.div>
            ) : isError ? (
                <motion.div
                    className='flex flex-col items-center justify-center py-12 text-gray-700 dark:text-gray-300'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <p className='text-lg font-medium mb-4'>
                        Error loading notes. Please try again later.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => refetch()}
                        className='px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg shadow-sm transition-all duration-200'
                    >
                        Retry
                    </motion.button>
                </motion.div>
            ) : filteredNotes.length === 0 ? (
                <motion.div
                    className='flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <p className='text-lg font-medium mb-4'>
                        No notes found
                        {searchQuery ? ' matching your search' : ''}
                    </p>
                    {searchQuery && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={clearSearch}
                            className='px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm transition-all duration-200'
                        >
                            Clear Search
                        </motion.button>
                    )}
                </motion.div>
            ) : (
                <AnimatePresence mode='wait'>
                    <motion.div
                        key='notes-sections'
                        initial='hidden'
                        animate='visible'
                        exit='hidden'
                        variants={containerVariants}
                        className='space-y-8'
                    >
                        {pinnedNotes.length > 0 && (
                            <AnimatePresence>
                                <motion.section
                                    variants={itemVariants}
                                    initial='hidden'
                                    animate='visible'
                                    exit='exit'
                                    className='bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden'
                                >
                                    <div className='flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-3'>
                                        <h3 className='text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2'>
                                            <span>📌 Pinned Notes</span>
                                            <span className='bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full'>
                                                {pinnedNotes.length}
                                            </span>
                                        </h3>
                                    </div>

                                    <div className='p-4'>
                                        {viewType === 'grid' ? (
                                            <Masonry
                                                columns={{
                                                    xs: 1,
                                                    sm: 3,
                                                    md: 4,
                                                    xl: 5,
                                                }}
                                                spacing={2}
                                            >
                                                <AnimatePresence mode='popLayout'>
                                                    {pinnedNotes.map(
                                                        (note: NoteI) => (
                                                            <motion.div
                                                                key={note._id}
                                                                layout
                                                                initial='hidden'
                                                                animate='visible'
                                                                exit='exit'
                                                                variants={
                                                                    itemVariants
                                                                }
                                                            >
                                                                <NoteCard
                                                                    note={note}
                                                                    onPinToggle={
                                                                        handlePinToggle
                                                                    }
                                                                    onArchiveToggle={
                                                                        handleArchiveToggle
                                                                    }
                                                                    onTrash={
                                                                        handleMoveToTrash
                                                                    }
                                                                    onEdit={
                                                                        openNote
                                                                    }
                                                                    onChangeColor={
                                                                        handleChangeColor
                                                                    }
                                                                    onClone={
                                                                        handleCloneNote
                                                                    }
                                                                    onRestore={
                                                                        handleRestoreFromTrash
                                                                    }
                                                                    onDelete={
                                                                        handleDeletePermanently
                                                                    }
                                                                />
                                                            </motion.div>
                                                        )
                                                    )}
                                                </AnimatePresence>
                                            </Masonry>
                                        ) : (
                                            <div className='flex flex-col gap-4'>
                                                <AnimatePresence mode='popLayout'>
                                                    {pinnedNotes.map(
                                                        (note: NoteI) => (
                                                            <motion.div
                                                                key={note._id}
                                                                layout
                                                                initial='hidden'
                                                                animate='visible'
                                                                exit='exit'
                                                                variants={
                                                                    itemVariants
                                                                }
                                                            >
                                                                <NoteCard
                                                                    note={note}
                                                                    onPinToggle={
                                                                        handlePinToggle
                                                                    }
                                                                    onArchiveToggle={
                                                                        handleArchiveToggle
                                                                    }
                                                                    onTrash={
                                                                        handleMoveToTrash
                                                                    }
                                                                    onEdit={
                                                                        openNote
                                                                    }
                                                                    onChangeColor={
                                                                        handleChangeColor
                                                                    }
                                                                    onClone={
                                                                        handleCloneNote
                                                                    }
                                                                    onRestore={
                                                                        handleRestoreFromTrash
                                                                    }
                                                                    onDelete={
                                                                        handleDeletePermanently
                                                                    }
                                                                />
                                                            </motion.div>
                                                        )
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </motion.section>
                            </AnimatePresence>
                        )}

                        {unpinnedNotes.length > 0 && (
                            <AnimatePresence>
                                <motion.section
                                    variants={itemVariants}
                                    initial='hidden'
                                    animate='visible'
                                    exit='exit'
                                    className='bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden'
                                >
                                    <div className='flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-3'>
                                        <h3 className='text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2'>
                                            <span>📝 Notes</span>
                                            <span className='bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full'>
                                                {unpinnedNotes.length}
                                            </span>
                                        </h3>
                                    </div>

                                    <div className='p-4'>
                                        {viewType === 'grid' ? (
                                            <Masonry
                                                columns={{
                                                    xs: 1,
                                                    sm: 3,
                                                    md: 4,
                                                    xl: 5,
                                                }}
                                                spacing={2}
                                            >
                                                <AnimatePresence mode='popLayout'>
                                                    {unpinnedNotes.map(
                                                        (note: NoteI) => (
                                                            <motion.div
                                                                key={note._id}
                                                                layout
                                                                initial='hidden'
                                                                animate='visible'
                                                                exit='exit'
                                                                variants={
                                                                    itemVariants
                                                                }
                                                            >
                                                                <NoteCard
                                                                    note={note}
                                                                    onPinToggle={
                                                                        handlePinToggle
                                                                    }
                                                                    onArchiveToggle={
                                                                        handleArchiveToggle
                                                                    }
                                                                    onTrash={
                                                                        handleMoveToTrash
                                                                    }
                                                                    onEdit={
                                                                        openNote
                                                                    }
                                                                    onChangeColor={
                                                                        handleChangeColor
                                                                    }
                                                                    onClone={
                                                                        handleCloneNote
                                                                    }
                                                                />
                                                            </motion.div>
                                                        )
                                                    )}
                                                </AnimatePresence>
                                            </Masonry>
                                        ) : (
                                            <div className='flex flex-col gap-4'>
                                                <AnimatePresence mode='popLayout'>
                                                    {unpinnedNotes.map(
                                                        (note: NoteI) => (
                                                            <motion.div
                                                                key={note._id}
                                                                layout
                                                                initial='hidden'
                                                                animate='visible'
                                                                exit='exit'
                                                                variants={
                                                                    itemVariants
                                                                }
                                                            >
                                                                <NoteCard
                                                                    note={note}
                                                                    onPinToggle={
                                                                        handlePinToggle
                                                                    }
                                                                    onArchiveToggle={
                                                                        handleArchiveToggle
                                                                    }
                                                                    onTrash={
                                                                        handleMoveToTrash
                                                                    }
                                                                    onEdit={
                                                                        openNote
                                                                    }
                                                                    onChangeColor={
                                                                        handleChangeColor
                                                                    }
                                                                    onClone={
                                                                        handleCloneNote
                                                                    }
                                                                />
                                                            </motion.div>
                                                        )
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </motion.section>
                            </AnimatePresence>
                        )}

                        {archivedNotes.length > 0 && searchQuery && (
                            <motion.section
                                variants={itemVariants}
                                className='bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden'
                            >
                                <div className='flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-3'>
                                    <h3 className='text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2'>
                                        <span>Archived Notes</span>
                                        <span className='bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full'>
                                            {archivedNotes.length}
                                        </span>
                                    </h3>
                                </div>
                                <div
                                    className={`p-4 ${
                                        viewType === 'grid'
                                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                                            : 'flex flex-col space-y-3'
                                    }`}
                                >
                                    <AnimatePresence>
                                        {archivedNotes.map((note: NoteI) => (
                                            <motion.div
                                                key={note._id}
                                                variants={itemVariants}
                                                initial='hidden'
                                                animate='visible'
                                                exit='exit'
                                                layout
                                            >
                                                <NoteCard
                                                    note={note}
                                                    onPinToggle={
                                                        handlePinToggle
                                                    }
                                                    onArchiveToggle={
                                                        handleArchiveToggle
                                                    }
                                                    onTrash={handleMoveToTrash}
                                                    onEdit={openNote}
                                                    onChangeColor={
                                                        handleChangeColor
                                                    }
                                                    onClone={handleCloneNote}
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.section>
                        )}

                        {trashedNotes.length > 0 && (
                            <motion.section
                                variants={itemVariants}
                                className='bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden'
                            >
                                <div className='flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-3'>
                                    <h3 className='text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2'>
                                        <span>Trash</span>
                                        <span className='bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full'>
                                            {trashedNotes.length}
                                        </span>
                                    </h3>
                                </div>
                                <div className='p-4'>
                                    {viewType === 'grid' ? (
                                        <Masonry
                                            columns={{
                                                xs: 1,
                                                sm: 3,
                                                md: 4,
                                                xl: 5,
                                            }}
                                            spacing={2}
                                        >
                                            <AnimatePresence mode='popLayout'>
                                                {trashedNotes.map(
                                                    (note: NoteI) => (
                                                        <motion.div
                                                            key={note._id}
                                                            layout
                                                            initial='hidden'
                                                            animate='visible'
                                                            exit='exit'
                                                            variants={
                                                                itemVariants
                                                            }
                                                        >
                                                            <NoteCard
                                                                note={note}
                                                                onPinToggle={
                                                                    handlePinToggle
                                                                }
                                                                onArchiveToggle={
                                                                    handleArchiveToggle
                                                                }
                                                                onTrash={
                                                                    handleMoveToTrash
                                                                }
                                                                onEdit={
                                                                    openNote
                                                                }
                                                                onChangeColor={
                                                                    handleChangeColor
                                                                }
                                                                onClone={
                                                                    handleCloneNote
                                                                }
                                                                onRestore={
                                                                    handleRestoreFromTrash
                                                                }
                                                                onDelete={
                                                                    handleDeletePermanently
                                                                }
                                                            />
                                                        </motion.div>
                                                    )
                                                )}
                                            </AnimatePresence>
                                        </Masonry>
                                    ) : (
                                        <div className='flex flex-col gap-4'>
                                            <AnimatePresence mode='popLayout'>
                                                {trashedNotes.map(
                                                    (note: NoteI) => (
                                                        <motion.div
                                                            key={note._id}
                                                            layout
                                                            initial='hidden'
                                                            animate='visible'
                                                            exit='exit'
                                                            variants={
                                                                itemVariants
                                                            }
                                                        >
                                                            <NoteCard
                                                                note={note}
                                                                onPinToggle={
                                                                    handlePinToggle
                                                                }
                                                                onArchiveToggle={
                                                                    handleArchiveToggle
                                                                }
                                                                onTrash={
                                                                    handleMoveToTrash
                                                                }
                                                                onEdit={
                                                                    openNote
                                                                }
                                                                onChangeColor={
                                                                    handleChangeColor
                                                                }
                                                                onClone={
                                                                    handleCloneNote
                                                                }
                                                                onRestore={
                                                                    handleRestoreFromTrash
                                                                }
                                                                onDelete={
                                                                    handleDeletePermanently
                                                                }
                                                            />
                                                        </motion.div>
                                                    )
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </motion.section>
                        )}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Note edit/create modal */}

            <AnimatePresence>
                {isModalOpen && editingNote && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className='fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50'
                        onClick={closeModal}
                    >
                        <motion.div
                            variants={modalVariants}
                            initial='hidden'
                            animate='visible'
                            exit='exit'
                            className='bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-3xl max-h-[85vh] overflow-auto'
                            onClick={(e) => e.stopPropagation()}
                            style={getModalStyle}
                        >
                            <div className=' border-gray-200 dark:border-gray-800 px-2 py-4'>
                                <div className='flex items-center justify-between'>
                                    <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
                                        {editingNote.pinned ? '📌 ' : ''}Edit
                                        Note
                                    </h2>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200'
                                        onClick={closeModal}
                                        aria-label='Close modal'
                                        title='Close (Esc)'
                                    >
                                        <CloseIcon size={20} />
                                    </motion.button>
                                </div>

                                {editingNote.labels &&
                                    editingNote.labels.length > 0 && (
                                        <div className='flex flex-wrap gap-2 mt-3'>
                                            {editingNote.labels.map(
                                                (label, index) => (
                                                    <span
                                                        key={index}
                                                        className='bg-green-50 dark:bg-blue-900 text-green-700 dark:text-blue-200 text-sm font-medium px-2.5 py-0.5 rounded-full'
                                                    >
                                                        {typeof label ===
                                                        'string'
                                                            ? label
                                                            : label.name}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    )}
                            </div>

                            {/* Reminder & Collaborators Info Bar */}
                            {(editingNote.reminder ||
                                (editingNote.collaborators &&
                                    editingNote.collaborators.length > 0)) && (
                                <div className='bg-gray-50 dark:bg-gray-800 px-2 py-2 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300 rounded-full'>
                                    {editingNote.reminder && (
                                        <div
                                            className='flex items-center bg-amber-100 p-2 rounded-full gap-1.5'
                                            title={`Reminder: ${formatReminderDate(
                                                editingNote.reminder
                                            )}`}
                                        >
                                            <Bell
                                                size={14}
                                                className='text-amber-500'
                                            />
                                            <span>
                                                {formatReminderDate(
                                                    editingNote.reminder
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    {editingNote.collaborators &&
                                        editingNote.collaborators.length >
                                            0 && (
                                            <div
                                                className='flex items-center gap-2 bg-blue-100 p-2 rounded-full'
                                                title={`Shared with ${
                                                    editingNote.collaborators
                                                        .length
                                                } ${
                                                    editingNote.collaborators
                                                        .length === 1
                                                        ? 'person'
                                                        : 'people'
                                                }`}
                                            >
                                                <Users
                                                    size={14}
                                                    className='text-blue-500'
                                                />
                                                <span>
                                                    Shared with{' '}
                                                    {
                                                        editingNote
                                                            .collaborators
                                                            .length
                                                    }
                                                    {editingNote.collaborators
                                                        .length === 1
                                                        ? ' person'
                                                        : ' people'}
                                                </span>
                                                <div className='flex -space-x-2 ml-1'>
                                                    {editingNote.collaborators
                                                        .slice(0, 3)
                                                        .map(
                                                            (
                                                                collaborator,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        collaborator.firebaseUid ||
                                                                        index
                                                                    }
                                                                    className='w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300 ring-2 ring-white dark:ring-gray-900 overflow-hidden'
                                                                    title={
                                                                        collaborator.email
                                                                    }
                                                                >
                                                                    {collaborator.photo ? (
                                                                        <Image
                                                                            src={
                                                                                collaborator.photo
                                                                            }
                                                                            alt={
                                                                                collaborator.name ||
                                                                                collaborator.email ||
                                                                                'Collaborator'
                                                                            }
                                                                            width={
                                                                                40
                                                                            }
                                                                            height={
                                                                                40
                                                                            }
                                                                            className='w-full h-full object-cover'
                                                                        />
                                                                    ) : (
                                                                        getInitials(
                                                                            collaborator.name ||
                                                                                collaborator.email ||
                                                                                ''
                                                                        )
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    {editingNote.collaborators
                                                        .length > 3 && (
                                                        <div className='w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300 ring-2 ring-white dark:ring-gray-900'>
                                                            +
                                                            {editingNote
                                                                .collaborators
                                                                .length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            )}

                            <div className='modal-body my-4'>
                                <NoteInput
                                    isEditing={true}
                                    noteToEdit={editingNote}
                                    onSuccess={() => {
                                        closeModal();
                                        refetch();
                                    }}
                                />
                                {/* Image Preview Section - Add this after the labels */}
                                {editingNote.images &&
                                    editingNote.images.length > 0 && (
                                        <div className='px-2 py-2'>
                                            <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                                Attached Images
                                            </h3>
                                            <ImagePreview
                                                images={editingNote.images}
                                                onImageClick={(imageUrl) =>
                                                    setPreviewImageUrl(imageUrl)
                                                }
                                                onImageRemove={async (
                                                    index
                                                ) => {
                                                    try {
                                                        const imageToDelete =
                                                            editingNote
                                                                .images?.[
                                                                index
                                                            ];

                                                        const updatedImages = [
                                                            ...(editingNote.images ||
                                                                []),
                                                        ];
                                                        updatedImages.splice(
                                                            index,
                                                            1
                                                        );

                                                        setEditingNote({
                                                            ...editingNote,
                                                            images: updatedImages,
                                                        });

                                                        if (editingNote._id) {
                                                            let imageUrl = '';

                                                            // Handle different image types
                                                            if (
                                                                typeof imageToDelete ===
                                                                'string'
                                                            ) {
                                                                imageUrl =
                                                                    imageToDelete;
                                                            } else if (
                                                                imageToDelete instanceof
                                                                File
                                                            ) {
                                                                imageUrl =
                                                                    imageToDelete.name;
                                                            } else {
                                                                console.warn(
                                                                    'Unknown image type:',
                                                                    imageToDelete
                                                                );
                                                                return;
                                                            }

                                                            console.log(
                                                                'Deleting image:',
                                                                {
                                                                    noteId: editingNote._id,
                                                                    imageUrl,
                                                                }
                                                            );

                                                            await deleteSingleImage(
                                                                {
                                                                    id: editingNote._id,
                                                                    imageUrl:
                                                                        imageUrl,
                                                                }
                                                            ).unwrap();
                                                        }

                                                        refetch();
                                                    } catch (error) {
                                                        console.error(
                                                            'Failed to delete image:',
                                                            error
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                            </div>

                            <div className='modal-footer'>
                                <div className='modal-date pt-4 border-t border-gray-700 px-2 text-sm text-gray-900'>
                                    {editingNote.updatedAt ? (
                                        <span>
                                            Edited{' '}
                                            {new Date(
                                                editingNote.updatedAt
                                            ).toLocaleString()}
                                        </span>
                                    ) : (
                                        <span>
                                            Created{' '}
                                            {new Date(
                                                editingNote.createdAt ||
                                                    Date.now()
                                            ).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Image Preview Modal */}
                {previewImageUrl && (
                    <ImagePreviewModal
                        imageUrl={previewImageUrl}
                        onClose={() => setPreviewImageUrl(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotesContainer;
