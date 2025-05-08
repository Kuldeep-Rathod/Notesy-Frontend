'use client';

import { NoteI } from '@/interfaces/notes';
import '@/styles/components/notes/_noteCard.scss';
import {
    Archive,
    ArchiveRestore,
    EllipsisVertical,
    Palette,
    PinIcon,
    PinOffIcon,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { MdRestoreFromTrash } from 'react-icons/md';

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

const colorOptions = [
    '#ffffff',
    '#f28b82',
    '#fbbc04',
    '#fff475',
    '#ccff90',
    '#a7ffeb',
    '#cbf0f8',
    '#d7aefb',
    '#fdcfe8',
    '#e6c9a8',
    '#e8eaed',
];

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

            <div className='note-actions'>
                {!note.trashed ? (
                    <>
                        <button
                            className='action-button'
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onArchiveToggle && note._id) {
                                    onArchiveToggle(note._id);
                                }
                            }}
                            aria-label={note.archived ? 'Unarchive' : 'Archive'}
                        >
                            {note.archived ? (
                                <ArchiveRestore size={18} />
                            ) : (
                                <Archive size={18} />
                            )}
                        </button>

                        <div className='color-picker-container'>
                            <button
                                className='action-button'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setColorMenuOpen(!colorMenuOpen);
                                    setMoreMenuOpen(false);
                                }}
                                aria-label='Change color'
                            >
                                <Palette size={18} />
                            </button>
                            {colorMenuOpen && (
                                <div
                                    className='color-picker'
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {colorOptions.map((color) => (
                                        <div
                                            key={color}
                                            className='color-option'
                                            style={{ backgroundColor: color }}
                                            onClick={() =>
                                                handleColorChange(color)
                                            }
                                            aria-label={`Color ${color}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            className='action-button'
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onTrash && note._id) onTrash(note._id);
                            }}
                            aria-label='Move to trash'
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className='more-menu-container'>
                            <button
                                className='action-button'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMoreMenuOpen(!moreMenuOpen);
                                    setColorMenuOpen(false);
                                }}
                                aria-label='More options'
                            >
                                <EllipsisVertical size={18} />
                            </button>
                            {moreMenuOpen && (
                                <div
                                    className='more-menu'
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => {
                                            if (onClone && note._id)
                                                onClone(note._id);
                                            setMoreMenuOpen(false);
                                        }}
                                    >
                                        Make a copy
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (onEdit) onEdit(note);
                                            setMoreMenuOpen(false);
                                        }}
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <button
                            className='action-button restore'
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onRestore && note._id) onRestore(note._id);
                            }}
                            aria-label='Restore note'
                        >
                            <MdRestoreFromTrash size={18} />
                        </button>
                        <button
                            className='action-button delete'
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onDelete && note._id) onDelete(note._id);
                            }}
                            aria-label='Delete permanently'
                        >
                            <Trash2 size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default NoteCard;
