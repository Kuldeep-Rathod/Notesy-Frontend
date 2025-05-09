'use client';

import { bgColors, bgImages } from '@/interfaces/tooltip';
import {
    selectNoteInput,
    setBgColor,
    setBgImage,
    toggleArchive,
    toggleCbox,
    toggleColorMenu,
    toggleLabelMenu,
    toggleMoreMenu,
    toggleTrash,
} from '@/redux/reducer/noteInputReducer';
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
import { MdRestoreFromTrash } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

interface NoteToolbarProps {
    onCloseClick: () => void;
    isEditing?: boolean;
}

export function NoteToolbar({
    onCloseClick,
    isEditing = false,
}: NoteToolbarProps) {
    const dispatch = useDispatch();
    // Redux state
    const {
        isCbox,
        isTrashed,
        tooltips: { moreMenuOpen, colorMenuOpen, labelMenuOpen },
    } = useSelector(selectNoteInput);

    const handleArchive = () => {
        dispatch(toggleArchive());
    };

    // More menu actions
    const moreMenu = {
        trash: () => {
            if (isEditing) {
                console.log('Trashing note');
            } else {
                dispatch(toggleTrash());
                onCloseClick();
            }
        },
        clone: () => {
            onCloseClick();
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
                    className={`note-input__toolbar-icon note-input__toolbar-icon--alarm H disabled pop`}
                    data-tooltip='Remind me'
                >
                    <Bell />
                </div>
                <div
                    className={`note-input__toolbar-icon note-input__toolbar-icon--collaborator H disabled pop`}
                    data-tooltip='Collaborator'
                >
                    <UserPlus />
                </div>
                <div
                    className={`note-input__toolbar-icon note-input__toolbar-icon--color H pop`}
                    data-tooltip='Background Options'
                    onClick={() => dispatch(toggleColorMenu())}
                >
                    <Palette />
                </div>
                <div
                    className={`note-input__toolbar-icon note-input__toolbar-icon--image H disabled pop`}
                    data-tooltip='Add image'
                >
                    <ImagePlus />
                </div>
                <div
                    className={`note-input__toolbar-icon note-input__toolbar-icon--archive H pop`}
                    onClick={handleArchive}
                    data-tooltip='Archive'
                >
                    <Archive />
                </div>
                <div
                    className={`note-input__toolbar-icon note-input__toolbar-icon--more H pop`}
                    data-tooltip='More'
                    onClick={() => dispatch(toggleMoreMenu())}
                >
                    <EllipsisVertical />
                </div>

                <div
                    className={`note-input__toolbar-icon note-input__toolbar-icon--undo disabled pop`}
                    data-tooltip='Undo'
                >
                    <Undo2 />
                </div>
                <div
                    className={`note-input__toolbar-icon note-input__toolbar-icon--redo disabled`}
                    data-tooltip='Redo'
                >
                    <Redo2 />
                </div>
            </div>
            <div
                className='note-input__button--close'
                onClick={onCloseClick}
            >
                Close
            </div>

            {/* Color menu */}
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

            {/* Label menu */}
        </div>
    );
}
