'use client';

import { NoteI } from '@/interfaces/notes';
import { bgColors } from '@/interfaces/tooltip';
import { useGetCollaboratorsQuery } from '@/redux/api/notesAPI';
import '@/styles/components/notes/_noteCard.scss';
import { format } from 'date-fns';
import {
    Archive,
    ArchiveRestore,
    Bell,
    EllipsisVertical,
    Palette,
    PinIcon,
    PinOffIcon,
    Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { MdRestoreFromTrash } from 'react-icons/md';
import { AnimatedTooltip } from '../ui/animated-tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface NoteCardProps {
    note: NoteI;
    onPinToggle?: (id: string) => void;
    onArchiveToggle?: (id: string) => void;
    onTrash?: (id: string) => void;
    onRestore?: (id: string) => void;
    onDelete?: (id: string) => void;
    onEdit?: (note: NoteI) => void;
    onChangeColor?: (id: string, color: string) => void;
    onClone?: (id: string) => void;
}

interface Collaborator {
    firebaseUid: string;
    email: string;
    name: string;
    photo: string | null;
}

interface CollaboratorsData {
    success: boolean;
    collaborators: Collaborator[];
    ownerId: string;
}

const colorOptions = bgColors;

const NoteCard = ({
    note,
    onPinToggle,
    onArchiveToggle,
    onTrash,
    onRestore,
    onDelete,
    onEdit,
    onChangeColor,
    onClone,
}: NoteCardProps) => {
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [colorMenuOpen, setColorMenuOpen] = useState(false);
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const { data: collaboratorsData } = useGetCollaboratorsQuery(
        note._id || '',
        {
            skip: !note._id || !note.sharedWith?.length,
            refetchOnMountOrArgChange: true,
            refetchOnFocus: true,
            refetchOnReconnect: true,
        }
    ) as { data: CollaboratorsData | undefined };

    // Check ownership: if note has collaborators, check collaboratorsData.ownerId, otherwise check note.firebaseUid
    const isOwner = note.sharedWith?.length
        ? currentUser?.uid === collaboratorsData?.ownerId
        : currentUser?.uid === note.firebaseUid;

    const handleEditClick = () => {
        if (onEdit) onEdit(note);
    };

    const handleColorChange = (color: string) => {
        if (onChangeColor && note._id) onChangeColor(note._id, color);
        setColorMenuOpen(false);
    };

    // Close menus when clicking elsewhere
    const handleGlobalClick = () => {
        if (moreMenuOpen) setMoreMenuOpen(false);
        if (colorMenuOpen) setColorMenuOpen(false);
    };

    // Generate initials for avatars
    const getInitials = (email: string) => {
        if (!email) return '?';
        return email.charAt(0).toUpperCase();
    };

    const transformedCollabData = collaboratorsData?.collaborators?.map(
        (collab, index) => ({
            id: index,
            name: collab.name,
            designation:
                collab.firebaseUid === collaboratorsData.ownerId
                    ? 'Owner'
                    : 'Member',
            image: collab.photo || '',
        })
    );

    return (
        <div
            className='note-card'
            style={{ backgroundColor: note.bgColor || '#ffffff' }}
            onClick={handleGlobalClick}
        >
            <div className='note-header'>
                <h4 onClick={handleEditClick}>{note.noteTitle}</h4>
                {onPinToggle && note._id && (
                    <button
                        className='pin-button'
                        onClick={(e) => {
                            e.stopPropagation();
                            onPinToggle(note._id!);
                        }}
                        aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                    >
                        {note.pinned ? (
                            <PinOffIcon size={20} />
                        ) : (
                            <PinIcon size={20} />
                        )}
                    </button>
                )}
            </div>

            {note.images && note.images.length > 0 && (
                <div
                    className='image-preview-container'
                    onClick={handleEditClick}
                >
                    <div className='image-preview'>
                        <Image
                            src={
                                typeof note.images[0] === 'string'
                                    ? note.images[0]
                                    : URL.createObjectURL(
                                          note.images[0] as File
                                      )
                            }
                            alt='Note attachment'
                            width={200}
                            height={150}
                            className='object-cover rounded-t-lg'
                            style={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'cover',
                            }}
                            priority
                        />
                    </div>
                    {note.images.length > 1 && (
                        <div className='image-count-badge'>
                            +{note.images.length - 1} more
                        </div>
                    )}
                </div>
            )}

            <div
                className='note-content'
                onClick={handleEditClick}
            >
                {note.noteBody && <p className='note-body'>{note.noteBody}</p>}

                {note.checklists && note.checklists.length > 0 && (
                    <div className='checklist-preview'>
                        {note.checklists.slice(0, 3).map((item, index) => (
                            <div
                                key={index}
                                className='checklist-item'
                            >
                                <div className='checkbox-wrapper'>
                                    <input
                                        type='checkbox'
                                        checked={item.checked}
                                        readOnly
                                    />
                                    <span
                                        className={
                                            item.checked ? 'checked' : ''
                                        }
                                    >
                                        {item.text}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {note.checklists.length > 3 && (
                            <div className='more-items'>
                                +{note.checklists.length - 3} more items
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Labels display */}
            {note.labels && note.labels.length > 0 && (
                <div className='note-labels'>
                    {note.labels.map((label, index) => (
                        <span
                            key={index}
                            className='label-chip'
                        >
                            {typeof label === 'string' ? label : label.name}
                        </span>
                    ))}
                </div>
            )}

            {/* Reminder Display */}

            {note.reminder && (
                <div className='note-labels'>
                    <span
                        className={`label-chip flex items-center gap-1 ${
                            new Date(note.reminder) < new Date()
                                ? 'line-through text-gray-400'
                                : ''
                        }`}
                    >
                        <Bell className='h-4 w-4' />
                        {format(new Date(note.reminder), 'MMM d, h:mm a')}
                    </span>
                </div>
            )}

            {/* Collaborators display */}
            {note.collaborators && note.collaborators.length > 0 && (
                <AnimatedTooltip items={transformedCollabData || []} />
            )}

            <div className='note-actions'>
                {!note.trashed ? (
                    <>
                        {isOwner && (
                            <>
                                <button
                                    className='action-button'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onArchiveToggle && note._id) {
                                            onArchiveToggle(note._id);
                                        }
                                    }}
                                    aria-label={
                                        note.archived ? 'Unarchive' : 'Archive'
                                    }
                                >
                                    {note.archived ? (
                                        <ArchiveRestore size={18} />
                                    ) : (
                                        <Archive size={18} />
                                    )}
                                </button>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            className='action-button'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMoreMenuOpen(false);
                                            }}
                                            aria-label='Change color'
                                        >
                                            <Palette size={18} />
                                        </button>
                                    </PopoverTrigger>

                                    <PopoverContent
                                        className='p-2 w-auto bg-white rounded-md shadow-lg border'
                                        onClick={(e) => e.stopPropagation()}
                                        align='end'
                                    >
                                        <div className='flex flex-wrap gap-2 max-w-[160px]'>
                                            {Object.entries(colorOptions).map(
                                                ([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className='w-6 h-6 rounded-full cursor-pointer border border-gray-200'
                                                        style={{
                                                            backgroundColor:
                                                                value,
                                                        }}
                                                        onClick={() =>
                                                            handleColorChange(
                                                                value
                                                            )
                                                        }
                                                        aria-label={`Color ${key}`}
                                                    />
                                                )
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                <button
                                    className='action-button'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onTrash && note._id)
                                            onTrash(note._id);
                                    }}
                                    aria-label='Move to trash'
                                >
                                    <Trash2 size={18} />
                                </button>
                            </>
                        )}

                        <div className='more-menu-container'>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMoreMenuOpen(!moreMenuOpen);
                                            setColorMenuOpen(false);
                                        }}
                                        className='action-button'
                                    >
                                        <EllipsisVertical size={18} />
                                    </button>
                                </PopoverTrigger>

                                <PopoverContent
                                    align='end'
                                    className='w-auto p-0 bg-white rounded-md shadow-lg border'
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className='flex flex-col'>
                                        <button
                                            onClick={() => {
                                                if (onClone && note._id)
                                                    onClone(note._id);
                                            }}
                                            className='px-4 py-2 text-left hover:bg-gray-100'
                                        >
                                            Make a copy
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (onEdit) onEdit(note);
                                            }}
                                            className='px-4 py-2 text-left hover:bg-gray-100'
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </>
                ) : (
                    <>
                        {isOwner && (
                            <>
                                <button
                                    className='action-button restore'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onRestore && note._id)
                                            onRestore(note._id);
                                    }}
                                    aria-label='Restore note'
                                >
                                    <MdRestoreFromTrash size={18} />
                                </button>
                                <button
                                    className='action-button delete'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onDelete && note._id)
                                            onDelete(note._id);
                                    }}
                                    aria-label='Delete permanently'
                                >
                                    <Trash2 size={18} />
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NoteCard;
