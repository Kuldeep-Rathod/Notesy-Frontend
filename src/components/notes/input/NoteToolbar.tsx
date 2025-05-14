'use client';

import { bgColors, bgImages } from '@/interfaces/tooltip';
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
    ImagePlus,
    Palette,
    Redo2,
    Trash2,
    Undo2,
    UserPlus,
} from 'lucide-react';
import { useEffect } from 'react';
import { MdRestoreFromTrash } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { CollaboratorMenu } from './CollaboratorMenu';
import { ReminderPicker } from './ReminderPicker';
import '@/styles/components/notes/_noteInput.scss';

interface NoteToolbarProps {
    onSaveClick: () => void;
    isEditing?: boolean;
}

export default function NoteToolbar({
    onSaveClick,
    isEditing = false,
}: NoteToolbarProps) {
    const dispatch = useDispatch();
    const reminderString = useSelector(
        (state: RootState) => state.noteInput.reminder
    );
    const reminder = reminderString ? new Date(reminderString) : null;
    const reminderMenuOpen = useSelector(
        (state: RootState) => state.noteInput.reminderMenuOpen
    );

    // Redux state
    const {
        isCbox,
        isTrashed,
        tooltips: { moreMenuOpen, colorMenuOpen, collaboratorMenuOpen },
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

    // Close reminder menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (
                !target.closest('.note-input__reminder-menu') &&
                !target.closest('.note-input__toolbar-icon--alarm')
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
            <div className={`note-input__toolbar note-input__toolbar--minimal`}>
                <div className='note-input__toolbar-icons'>
                    <div
                        className={`note-input__toolbar-icon note-input__toolbar-icon--delete H`}
                    >
                        <Trash2 />
                    </div>
                    <div
                        className={`note-input__toolbar-icon note-input__toolbar-icon--restore H`}
                    >
                        <MdRestoreFromTrash />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='note-input__toolbar'>
            <div className='note-input__toolbar-icons'>
                <div
                    className={`note-input__toolbar-icon note-input__toolbar-icon--alarm note-input--tooltip ${
                        reminder ? 'active' : ''
                    }`}
                    data-tooltip={
                        reminder
                            ? format(new Date(reminder), 'MMM d, h:mm a')
                            : 'Remind me'
                    }
                    onClick={handleReminderClick}
                >
                    <Bell className='h-5 w-5' />
                </div>

                <div
                    className={`note-input__toolbar-icon note-input__toolbar-icon--color H pop note-input--tooltip`}
                    data-tooltip='Collaborator'
                    onClick={handleCollaboratorClick}
                >
                    <UserPlus />
                </div>
                {collaboratorMenuOpen && (
                    <CollaboratorMenu onClose={handleCollaboratorClick} />
                )}

                <div
                    className={`note-input__toolbar-icon note-input__toolbar-icon--color H pop note-input--tooltip`}
                    data-tooltip='Background Options'
                    onClick={() => dispatch(toggleColorMenu())}
                >
                    <Palette />
                </div>
                <div
                    className={`note-input__toolbar-icon note-input__toolbar-icon--image H disabled pop note-input--tooltip`}
                    data-tooltip='Add image'
                >
                    <ImagePlus />
                </div>
                <div
                    className={`note-input__toolbar-icon note-input__toolbar-icon--archive H pop note-input--tooltip`}
                    onClick={handleArchive}
                    data-tooltip='Archive'
                >
                    <Archive />
                </div>
                <div
                    className={`note-input__toolbar-icon note-input__toolbar-icon--more H pop note-input--tooltip`}
                    data-tooltip='More'
                    onClick={() => dispatch(toggleMoreMenu())}
                >
                    <EllipsisVertical />
                </div>

                <div
                    className={`note-input__toolbar-icon note-input__toolbar-icon--undo disabled pop note-input--tooltip`}
                    data-tooltip='Undo'
                >
                    <Undo2 />
                </div>
                <div
                    className={`note-input__toolbar-icon note-input__toolbar-icon--redo disabled note-input--tooltip`}
                    data-tooltip='Redo'
                >
                    <Redo2 />
                </div>
            </div>
            <div
                className='note-input__button--close'
                onClick={onSaveClick}
            >
                Save
            </div>

            {/* More menu */}
            {moreMenuOpen && (
                <div
                    className='note-input__menu'
                    data-tooltip='true'
                    data-is-tooltip-open='true'
                >
                    <div
                        onClick={() => {
                            dispatch(toggleMoreMenu());
                            dispatch(toggleLabelMenu());
                        }}
                    >
                        Add label
                    </div>

                    <div
                        onClick={() => {
                            moreMenu.toggleCbox();
                            dispatch(toggleMoreMenu());
                        }}
                    >
                        {isCbox ? 'Hide checkboxes' : 'Show checkboxes'}
                    </div>
                </div>
            )}

            {/* Color menu */}
            {colorMenuOpen && (
                <div
                    className='note-input__color-menu'
                    data-tooltip='true'
                    data-is-tooltip-open='true'
                >
                    <div className='note-input__color-menu-row'>
                        {Object.entries(bgColors).map(([key, value]) => (
                            <div
                                key={key}
                                data-bg-color={key}
                                style={{ backgroundColor: value }}
                                onClick={() => {
                                    colorMenu.bgColor(value);
                                    dispatch(toggleColorMenu());
                                }}
                                className={
                                    value === ''
                                        ? 'note-input__color-menu-option--transparent'
                                        : 'note-input__color-menu-option'
                                }
                            ></div>
                        ))}
                    </div>
                    <div className='note-input__color-menu-row'>
                        {Object.entries(bgImages).map(([key, value]) => (
                            <div
                                key={key}
                                data-bg-image={key}
                                style={{ backgroundImage: value || 'none' }}
                                onClick={() => {
                                    colorMenu.bgImage(value);
                                    dispatch(toggleColorMenu());
                                }}
                                className={
                                    value === ''
                                        ? 'note-input__color-menu-option--transparent'
                                        : 'note-input__color-menu-option'
                                }
                            ></div>
                        ))}
                    </div>
                </div>
            )}

            {reminderMenuOpen && (
                <div className='note-input__reminder-menu'>
                    <ReminderPicker onReminderSet={handleReminderSet} />
                </div>
            )}
        </div>
    );
}
