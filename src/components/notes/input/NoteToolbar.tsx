'use client';

import {
    closeReminderMenu,
    selectNoteInput,
    setBgColor,
    setBgImage,
    setReminder,
    toggleArchive,
    toggleCbox,
    toggleCollaboratorMenu,
    toggleColorMenu,
    toggleLabelMenu,
    toggleMoreMenu,
    toggleReminderMenu,
    toggleTrash,
} from '@/redux/reducer/noteInputReducer';
import { RootState } from '@/redux/store';
import { format } from 'date-fns';
import {
    Archive,
    Bell,
    EllipsisVertical,
    Palette,
    Redo2,
    Trash2,
    Undo2,
    UserPlus,
    Image as ImageIcon,
} from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { MdRestoreFromTrash } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { CollaboratorMenu } from './CollaboratorMenu';
import { ReminderPicker } from './ReminderPicker';
import { bgColors, bgImages } from '@/interfaces/tooltip';

interface NoteToolbarProps {
    onSaveClick: () => void;
    isEditing?: boolean;
    onImageChange?: (files: File[]) => void;
}

export default function NoteToolbar({
    onSaveClick,
    isEditing = false,
    onImageChange,
}: NoteToolbarProps) {
    const dispatch = useDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const reminderString = useSelector(
        (state: RootState) => state.noteInput.reminder
    );
    const reminder = reminderString ? new Date(reminderString) : null;

    // Redux state
    const {
        isCbox,
        isTrashed,
        tooltips: {
            moreMenuOpen,
            colorMenuOpen,
            collaboratorMenuOpen,
            reminderMenuOpen,
        },
    } = useSelector(selectNoteInput);

    const handleArchive = () => {
        dispatch(toggleArchive());
    };

    const handleCollaboratorClick = () => {
        dispatch(toggleCollaboratorMenu());
    };

    const handleReminderClick = () => {
        dispatch(toggleReminderMenu());
    };

    const handleReminderSet = (date: Date | null) => {
        setReminder(date ? date.toISOString() : null);
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const changeImageHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (onImageChange) {
            onImageChange(files);
        }
    };

    // Close reminder menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (
                !target.closest('.reminder-menu') &&
                !target.closest('.reminder-button')
            ) {
                dispatch(closeReminderMenu());
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dispatch]);

    // More menu actions
    const moreMenu = {
        trash: () => {
            if (isEditing) {
                console.log('Trashing note');
            } else {
                dispatch(toggleTrash());
                onSaveClick();
            }
        },
        clone: () => {
            onSaveClick();
        },
        toggleCbox: () => {
            dispatch(toggleCbox());
        },
    };

    // Color menu actions
    const colorMenu = {
        bgColor: (color: string) => {
            dispatch(setBgColor(color));
        },
        bgImage: (image: string) => {
            dispatch(setBgImage(image));
        },
    };

    if (isTrashed) {
        return (
            <div className='flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-lg'>
                <div className='flex space-x-4'>
                    <button
                        className='text-red-500 hover:text-red-600 transition-colors duration-200 p-2 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200'
                        title='Delete permanently'
                    >
                        <Trash2 className='h-5 w-5' />
                    </button>
                    <button
                        className='text-green-500 hover:text-green-600 transition-colors duration-200 p-2 rounded-full hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-200'
                        title='Restore note'
                    >
                        <MdRestoreFromTrash className='h-5 w-5' />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='flex items-center justify-between px-3 py-2 bg-white border-t border-gray-200 rounded-lg shadow-sm relative'>
            <div className='flex flex-wrap items-center gap-1'>
                <button
                    className={`p-2 rounded-full transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-300 relative group reminder-button ${
                        reminder ? 'text-blue-500' : 'text-gray-500'
                    }`}
                    onClick={handleReminderClick}
                    aria-label='Set reminder'
                >
                    <Bell className='h-5 w-5' />
                    <span className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
                        {reminder
                            ? format(new Date(reminder), 'MMM d, h:mm a')
                            : 'Remind me'}
                    </span>
                </button>

                <button
                    className='p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-300 relative group'
                    onClick={handleCollaboratorClick}
                    aria-label='Add collaborator'
                >
                    <UserPlus className='h-5 w-5' />
                    <span className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                        Collaborator
                    </span>
                </button>

                <button
                    className='p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-300 relative group'
                    onClick={() => dispatch(toggleColorMenu())}
                    aria-label='Background options'
                >
                    <Palette className='h-5 w-5' />
                    <span className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                        Background Options
                    </span>
                </button>

                <button
                    className='p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-300 relative group'
                    onClick={handleImageClick}
                    aria-label='Add image'
                >
                    <ImageIcon className='h-5 w-5' />
                    <span className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                        Add image
                    </span>
                </button>
                <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    multiple
                    onChange={changeImageHandler}
                    className='hidden'
                />

                <button
                    className='p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-300 relative group'
                    onClick={handleArchive}
                    aria-label='Archive'
                >
                    <Archive className='h-5 w-5' />
                    <span className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                        Archive
                    </span>
                </button>

                <button
                    className='p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-300 relative group'
                    onClick={() => dispatch(toggleMoreMenu())}
                    aria-label='More options'
                >
                    <EllipsisVertical className='h-5 w-5' />
                    <span className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                        More
                    </span>
                </button>

                <div className='h-6 mx-1 border-l border-gray-300'></div>

                <button
                    className='p-2 rounded-full text-gray-300 cursor-not-allowed transition-all duration-200 relative group'
                    aria-label='Undo'
                    disabled
                >
                    <Undo2 className='h-5 w-5' />
                    <span className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                        Undo
                    </span>
                </button>

                <button
                    className='p-2 rounded-full text-gray-300 cursor-not-allowed transition-all duration-200 relative group'
                    aria-label='Redo'
                    disabled
                >
                    <Redo2 className='h-5 w-5' />
                    <span className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                        Redo
                    </span>
                </button>
            </div>

            <button
                className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 text-sm font-medium'
                onClick={onSaveClick}
            >
                Save
            </button>

            {/* More menu */}
            {moreMenuOpen && (
                <div className='absolute left-1/3 bottom-14 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-40 z-10'>
                    <button
                        className='w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150 text-gray-700 text-sm'
                        onClick={() => {
                            dispatch(toggleMoreMenu());
                            dispatch(toggleLabelMenu());
                        }}
                    >
                        Add label
                    </button>

                    <button
                        className='w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150 text-gray-700 text-sm'
                        onClick={() => {
                            moreMenu.toggleCbox();
                            dispatch(toggleMoreMenu());
                        }}
                    >
                        {isCbox ? 'Hide checkboxes' : 'Show checkboxes'}
                    </button>

                    <button
                        className='w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150 text-red-500 text-sm'
                        onClick={() => {
                            moreMenu.trash();
                            dispatch(toggleMoreMenu());
                        }}
                    >
                        Move to trash
                    </button>
                </div>
            )}

            {/* Color menu */}
            {colorMenuOpen && (
                <div className='absolute left-0 top-[3.5rem] bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10'>
                    <div className='grid grid-cols-4 gap-2 mb-2'>
                        {Object.entries(bgColors).map(([key, value]) => (
                            <div
                                key={key}
                                data-bg-color={key}
                                style={{ backgroundColor: value || '#fff' }}
                                onClick={() => {
                                    colorMenu.bgColor(value);
                                    dispatch(toggleColorMenu());
                                }}
                                className={`w-12 h-12 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all duration-200 flex items-center justify-center text-xs font-medium text-center ${
                                    value === ''
                                        ? 'border border-gray-300 text-gray-600'
                                        : 'text-black'
                                }`}
                                title={key}
                            >
                                {key}
                            </div>
                        ))}
                    </div>
                    <div className='grid grid-cols-4 gap-2'>
                        {Object.entries(bgImages).map(([key, value]) => (
                            <div
                                key={key}
                                data-bg-image={key}
                                style={{ backgroundImage: value || 'none' }}
                                onClick={() => {
                                    colorMenu.bgImage(value);
                                    dispatch(toggleColorMenu());
                                }}
                                className={`w-8 h-8 rounded-lg cursor-pointer bg-center bg-cover hover:ring-2 hover:ring-blue-400 transition-all duration-200 ${
                                    value === '' ? 'border border-gray-300' : ''
                                }`}
                                title={key}
                            ></div>
                        ))}
                    </div>
                </div>
            )}

            {reminderMenuOpen && (
                <div className='absolute left-0 top-[3.5rem] bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 reminder-menu'>
                    <ReminderPicker onReminderSet={handleReminderSet} />
                </div>
            )}

            {collaboratorMenuOpen && (
                <div className='absolute left-0 top-[3.5rem] bg-white rounded-lg shadow-lg border border-gray-200 z-10'>
                    <CollaboratorMenu onClose={handleCollaboratorClick} />
                </div>
            )}
        </div>
    );
}
