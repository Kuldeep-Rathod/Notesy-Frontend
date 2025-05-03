'use client';

import { useState } from 'react';
import {
    Archive,
    ArchiveRestore,
    EllipsisVertical,
    Palette,
    Trash2,
} from 'lucide-react';
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

interface Note {
    id: number;
    noteTitle: string;
    noteBody: string;
    pinned: boolean;
    archived: boolean;
    trashed: boolean;
    color?: string;
    labels?: string[];
}

interface NoteCardProps {
    note: Note;
    onPinToggle?: (id: number) => void;
    onArchiveToggle?: (id: number) => void;
    onTrash?: (id: number) => void;
    onRestore?: (id: number) => void;
    onDelete?: (id: number) => void;
    onEdit?: (note: Note) => void;
    onChangeColor?: (id: number, color: string) => void;
    onClone?: (id: number) => void;
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
        if (onChangeColor) onChangeColor(note.id, color);
        setColorMenuOpen(false);
    };

    return (
        <div
            className='note-card'
            style={{ backgroundColor: note.color || '#ffffff' }}
        >
            <div className='note-header'>
                <h4 onClick={handleEditClick}>{note.noteTitle}</h4>
                {onPinToggle && (
                    <button
                        className='pin-button'
                        onClick={() => onPinToggle(note.id)}
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
            </div>
            <div className='note-actions'>
                {!note.trashed ? (
                    <>
                        <button
                            className='action-button'
                            onClick={() =>
                                onArchiveToggle && onArchiveToggle(note.id)
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
                            onClick={() => onTrash && onTrash(note.id)}
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
                                            if (onClone) onClone(note.id);
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
                            onClick={() => onRestore && onRestore(note.id)}
                            aria-label='Restore note'
                        >
                            <MdRestoreFromTrash size={18} />
                        </button>
                        <button
                            className='action-button delete'
                            onClick={() => onDelete && onDelete(note.id)}
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
