'use client';

import { NoteI } from '@/interfaces/notes';
import {
    Archive,
    ArchiveRestore,
    EllipsisVertical,
    Palette,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { MdRestoreFromTrash } from 'react-icons/md';

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

    return (
        <div
            className='note-card'
            style={{ backgroundColor: note.bgColor || '#ffffff' }}
        >
            <div className='note-header'>
                <h4 onClick={handleEditClick}>{note.noteTitle}</h4>
                {onPinToggle && note._id && (
                    <button
                        className='pin-button'
                        onClick={() => onPinToggle(note._id!)}
                        aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                    >
                        {note.pinned ? (
                            <svg
                                width='16'
                                height='16'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    fill='currentColor'
                                    d='M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z'
                                />
                            </svg>
                        ) : (
                            <svg
                                width='16'
                                height='16'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    fill='currentColor'
                                    d='M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12M8.8,14L10,12.8V4H14V12.8L15.2,14H8.8Z'
                                />
                            </svg>
                        )}
                    </button>
                )}
            </div>
            <div
                className='note-content'
                onClick={handleEditClick}
            >
                <p>{note.noteBody}</p>
                {note.checklists && note.checklists.length > 0 && (
                    <div className='checklist-preview'>
                        {note.checklists.slice(0, 3).map((item, index) => (
                            <div
                                key={index}
                                className='checklist-item'
                            >
                                <input
                                    type='checkbox'
                                    checked={item.checked}
                                    readOnly
                                />
                                <span>{item.text}</span>
                            </div>
                        ))}
                        {note.checklists.length > 3 && (
                            <div className='more-items'>
                                +{note.checklists.length - 3} more
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className='note-actions'>
                {!note.trashed ? (
                    <>
                        <button
                            className='action-button'
                            onClick={() =>
                                onArchiveToggle &&
                                note._id &&
                                onArchiveToggle(note._id)
                            }
                            aria-label={note.archived ? 'Unarchive' : 'Archive'}
                        >
                            {note.archived ? (
                                <ArchiveRestore size={18} />
                            ) : (
                                <Archive size={18} />
                            )}
                        </button>
                        <button
                            className='action-button'
                            onClick={() =>
                                onTrash && note._id && onTrash(note._id)
                            }
                            aria-label='Move to trash'
                        >
                            <Trash2 size={18} />
                        </button>
                        <div className='color-picker-container'>
                            <button
                                className='action-button'
                                onClick={() => setColorMenuOpen(!colorMenuOpen)}
                                aria-label='Change color'
                            >
                                <Palette size={18} />
                            </button>
                            {colorMenuOpen && (
                                <div className='color-picker'>
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
                        <div className='more-menu-container'>
                            <button
                                className='action-button'
                                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                                aria-label='More options'
                            >
                                <EllipsisVertical size={18} />
                            </button>
                            {moreMenuOpen && (
                                <div className='more-menu'>
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
                            onClick={() =>
                                onRestore && note._id && onRestore(note._id)
                            }
                            aria-label='Restore note'
                        >
                            <MdRestoreFromTrash size={18} />
                        </button>
                        <button
                            className='action-button delete'
                            onClick={() =>
                                onDelete && note._id && onDelete(note._id)
                            }
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
