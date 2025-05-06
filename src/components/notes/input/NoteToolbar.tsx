'use client';

import {
    Archive,
    Bell,
    EllipsisVertical,
    ImagePlus,
    Palette,
    PinIcon,
    Redo2,
    Trash2,
    Undo2,
    UserPlus,
} from 'lucide-react';
import { MdRestoreFromTrash } from 'react-icons/md';

interface NoteToolbarProps {
    isTrashed: boolean;
    onArchive: () => void;
    onPinToggle: () => void;
    onMoreClick: () => void;
    onColorClick: () => void;
    pinned: boolean;
}

export function NoteToolbar({
    isTrashed,
    onArchive,
    onPinToggle,
    onMoreClick,
    onColorClick,
    pinned,
}: NoteToolbarProps) {
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
                    onClick={onColorClick}
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
                    onClick={onArchive}
                    data-tooltip='Archive'
                >
                    <Archive />
                </div>
                <div
                    className={`note-input__toolbar-icon note-input__toolbar-icon--more H pop`}
                    data-tooltip='More'
                    onClick={onMoreClick}
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
                onClick={onArchive}
            >
                Close
            </div>
        </div>
    );
}
