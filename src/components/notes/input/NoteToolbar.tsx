'use client';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { bgColors, bgImages } from '@/interfaces/tooltip';
import {
    selectNoteInput,
    setBgColor,
    setBgImage,
    toggleArchive,
    toggleCbox,
    toggleCollaboratorMenu,
    toggleColorMenu,
    toggleLabelMenu,
    toggleReminderMenu,
    toggleTrash,
} from '@/redux/reducer/noteInputReducer';
import { RootState } from '@/redux/store';
import { format } from 'date-fns';
import {
    Archive,
    Bell,
    EllipsisVertical,
    Image as ImageIcon,
    Palette,
    Redo2,
    Trash2,
    Undo2,
    UserPlus,
} from 'lucide-react';
import { ChangeEvent, MouseEvent, useRef, useState } from 'react';
import { MdRestoreFromTrash } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { CollaboratorMenu } from './CollaboratorMenu';
import LabelMenu from './LabelMenu';
import { ReminderPicker } from './ReminderPicker';

interface NoteToolbarProps {
    onSaveClick: () => void;
    isEditing?: boolean;
    onImageChange?: (files: File[]) => void;
    noteToEdit?: { _id?: string };
}

export default function NoteToolbar({
    onSaveClick,
    isEditing = false,
    onImageChange,
    noteToEdit,
}: NoteToolbarProps) {
    const dispatch = useDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    const reminderString = useSelector(
        (state: RootState) => state.noteInput.reminder
    );
    const reminder = reminderString ? new Date(reminderString) : null;

    // Redux state - now using Redux for popover states
    const {
        isCbox,
        isTrashed,
        tooltips: {
            reminderMenuOpen,
            collaboratorMenuOpen,
            colorMenuOpen,
            labelMenuOpen,
        },
    } = useSelector(selectNoteInput);

    const handleArchive = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(toggleArchive());
    };

    const handleAddImage = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const changeImageHandler = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.target.files || []);
        if (onImageChange) {
            onImageChange(files);
        }
    };

    const handleCollaboratorClose = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(toggleCollaboratorMenu());
    };

    const handleLabelMenuOpen = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMoreMenuOpen(false);
        setTimeout(() => {
            dispatch(toggleLabelMenu());
        }, 50);
    };

    const handleLabelMenuClose = () => {
        dispatch(toggleLabelMenu());
    };

    // Popover toggle handlers
    const handleReminderToggle = (open: boolean) => {
        if (open !== reminderMenuOpen) {
            dispatch(toggleReminderMenu());
        }
    };

    const handleCollaboratorToggle = (open: boolean) => {
        if (open !== collaboratorMenuOpen) {
            dispatch(toggleCollaboratorMenu());
        }
    };

    const handleColorToggle = (open: boolean) => {
        if (open !== colorMenuOpen) {
            dispatch(toggleColorMenu());
        }
    };

    const handleLabelToggle = (open: boolean) => {
        if (open !== labelMenuOpen) {
            dispatch(toggleLabelMenu());
        }
    };

    // More menu actions
    const moreMenu = {
        trash: (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMoreMenuOpen(false);
            if (isEditing) {
                console.log('Trashing note');
            } else {
                dispatch(toggleTrash());
                onSaveClick();
            }
        },
        clone: (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMoreMenuOpen(false);
            onSaveClick();
        },
        toggleCbox: (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMoreMenuOpen(false);
            dispatch(toggleCbox());
        },
    };

    // Color menu actions
    const colorMenu = {
        bgColor: (color: string, e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            dispatch(setBgColor(color));
        },
        bgImage: (image: string, e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
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
        <div
            className='flex items-center justify-between px-3 py-2 bg-white border-t border-gray-200 rounded-lg shadow-sm relative'
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className='flex flex-wrap items-center gap-1'>
                {/* Reminder Popover */}
                <Popover
                    open={reminderMenuOpen}
                    onOpenChange={handleReminderToggle}
                >
                    <PopoverTrigger asChild>
                        <button
                            className={`p-2 rounded-full transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-300 relative group ${
                                reminder ? 'text-blue-500' : 'text-gray-500'
                            }`}
                            aria-label='Set reminder'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Bell className='h-5 w-5' />
                            <span className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
                                {reminder
                                    ? format(
                                          new Date(reminder),
                                          'MMM d, h:mm a'
                                      )
                                    : 'Remind me'}
                            </span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        className='w-auto p-0'
                        align='start'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ReminderPicker />
                    </PopoverContent>
                </Popover>

                {/* Collaborator Popover */}
                <Popover
                    open={collaboratorMenuOpen}
                    onOpenChange={handleCollaboratorToggle}
                >
                    <PopoverTrigger asChild>
                        <button
                            className='p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-300 relative group'
                            aria-label='Add collaborator'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <UserPlus className='h-5 w-5' />
                            <span className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                                Collaborator
                            </span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        className='w-auto p-0'
                        align='start'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CollaboratorMenu onClose={handleCollaboratorClose} />
                    </PopoverContent>
                </Popover>

                {/* Color Popover */}
                <Popover
                    open={colorMenuOpen}
                    onOpenChange={handleColorToggle}
                >
                    <PopoverTrigger asChild>
                        <button
                            className='p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-300 relative group'
                            aria-label='Background options'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Palette className='h-5 w-5' />
                            <span className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                                Background Options
                            </span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        className='w-auto p-3'
                        align='start'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='grid grid-cols-4 gap-2 mb-2'>
                            {Object.entries(bgColors).map(([key, value]) => (
                                <div
                                    key={key}
                                    data-bg-color={key}
                                    style={{ backgroundColor: value || '#fff' }}
                                    onClick={(e) => colorMenu.bgColor(value, e)}
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
                                    onClick={(e) => colorMenu.bgImage(value, e)}
                                    className={`w-8 h-8 rounded-lg cursor-pointer bg-center bg-cover hover:ring-2 hover:ring-blue-400 transition-all duration-200 ${
                                        value === ''
                                            ? 'border border-gray-300'
                                            : ''
                                    }`}
                                    title={key}
                                ></div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Image Upload Button */}
                <button
                    className='p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-300 relative group'
                    onClick={handleAddImage}
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

                {/* Archive Button */}
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

                {/* More Options Popover */}
                <Popover
                    open={isMoreMenuOpen}
                    onOpenChange={setIsMoreMenuOpen}
                >
                    <PopoverTrigger asChild>
                        <button
                            className='p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-300 relative group'
                            aria-label='More options'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <EllipsisVertical className='h-5 w-5' />
                            <span className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                                More
                            </span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        className='w-40 p-1'
                        align='end'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className='w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150 text-gray-700 text-sm'
                            onClick={handleLabelMenuOpen}
                        >
                            Add label
                        </button>
                        <button
                            className='w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150 text-gray-700 text-sm'
                            onClick={(e) => moreMenu.toggleCbox(e)}
                        >
                            {isCbox ? 'Hide checkboxes' : 'Show checkboxes'}
                        </button>
                        <button
                            className='w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150 text-red-500 text-sm'
                            onClick={(e) => moreMenu.trash(e)}
                        >
                            Move to trash
                        </button>
                    </PopoverContent>
                </Popover>

                {/* Label Menu Popover */}
                <Popover
                    open={labelMenuOpen}
                    onOpenChange={handleLabelToggle}
                >
                    <PopoverTrigger asChild>
                        <button
                            className={`p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-300 relative group ${
                                labelMenuOpen
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'text-gray-500 hover:bg-gray-100'
                            }`}
                            style={{
                                position: 'absolute',
                                right: '52px',
                                opacity: 0,
                                pointerEvents: 'none',
                            }}
                        >
                            <EllipsisVertical className='h-5 w-5' />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        className='w-auto p-0'
                        align='end'
                        side='top'
                        sideOffset={8}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <LabelMenu
                            isEditing={isEditing}
                            noteToEdit={noteToEdit}
                            onClose={handleLabelMenuClose}
                        />
                    </PopoverContent>
                </Popover>

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
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSaveClick();
                }}
            >
                Save
            </button>
        </div>
    );
}
