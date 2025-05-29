import { NoteI } from '@/interfaces/notes';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X as CloseIcon, Users } from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';
import { ImagePreview } from './input/ImagePreview';
import NoteInput from './NoteInput';

interface NoteModalProps {
    isOpen: boolean;
    editingNote: NoteI | null;
    onClose: () => void;
    onRefetch: () => void;
    onImageRemove: (index: number) => Promise<void>;
    onImageClick: (imageUrl: string) => void;
}

const NoteModal = ({
    isOpen,
    editingNote,
    onClose,
    onRefetch,
    onImageRemove,
    onImageClick,
}: NoteModalProps) => {
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

    if (!isOpen || !editingNote) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className='fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50'
                onClick={onClose}
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
                                {editingNote.pinned ? '📌 ' : ''}Edit Note
                            </h2>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200'
                                onClick={onClose}
                                aria-label='Close modal'
                                title='Close (Esc)'
                            >
                                <CloseIcon size={20} />
                            </motion.button>
                        </div>

                        {editingNote.labels &&
                            editingNote.labels.length > 0 && (
                                <div className='flex flex-wrap gap-2 mt-3'>
                                    {editingNote.labels.map((label, index) => (
                                        <span
                                            key={index}
                                            className='bg-green-50 dark:bg-blue-900 text-green-700 dark:text-blue-200 text-sm font-medium px-2.5 py-0.5 rounded-full'
                                        >
                                            {typeof label === 'string'
                                                ? label
                                                : label.name}
                                        </span>
                                    ))}
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
                                editingNote.collaborators.length > 0 && (
                                    <div
                                        className='flex items-center gap-2 bg-blue-100 p-2 rounded-full'
                                        title={`Shared with ${
                                            editingNote.collaborators.length
                                        } ${
                                            editingNote.collaborators.length ===
                                            1
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
                                            {editingNote.collaborators.length}
                                            {editingNote.collaborators
                                                .length === 1
                                                ? ' person'
                                                : ' people'}
                                        </span>
                                        <div className='flex -space-x-2 ml-1'>
                                            {editingNote.collaborators
                                                .slice(0, 3)
                                                .map((collaborator, index) => (
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
                                                                width={40}
                                                                height={40}
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
                                                ))}
                                            {editingNote.collaborators.length >
                                                3 && (
                                                <div className='w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300 ring-2 ring-white dark:ring-gray-900'>
                                                    +
                                                    {editingNote.collaborators
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
                                onClose();
                                onRefetch();
                            }}
                        />
                        {/* Image Preview Section */}
                        {editingNote.images &&
                            editingNote.images.length > 0 && (
                                <div className='px-2 py-2'>
                                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                        Attached Images
                                    </h3>
                                    <ImagePreview
                                        images={editingNote.images}
                                        onImageClick={onImageClick}
                                        onImageRemove={onImageRemove}
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
                                        editingNote.createdAt || Date.now()
                                    ).toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NoteModal;
