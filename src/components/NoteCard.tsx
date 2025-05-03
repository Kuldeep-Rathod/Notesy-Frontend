'use client';

import '@/styles/components/_noteCard.scss';
import {
    Archive,
    ArchiveRestore,
    EllipsisVertical,
    Palette,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { MdRestoreFromTrash } from 'react-icons/md';

interface Note {
    id: number;
    title: string;
    content: string;
    pinned: boolean;
    archived: boolean;
    trashed: boolean;
    color?: string;
    labels?: string[];
}

interface Label {
    id: number;
    name: string;
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

const DummyNotes = () => {
    const [notes, setNotes] = useState<Note[]>([
        {
            id: 1,
            title: 'Pinned Note',
            content: 'This is a pinned note',
            pinned: true,
            archived: false,
            trashed: false,
            color: '#fff475',
        },
        {
            id: 2,
            title: 'Regular Note',
            content:
                'This is a regular note with some longer content to demonstrate how the card will handle text overflow.',
            pinned: false,
            archived: false,
            trashed: false,
            color: '#a7ffeb',
        },
        {
            id: 3,
            title: 'Archived Note',
            content: 'This is an archived note',
            pinned: false,
            archived: true,
            trashed: false,
            color: '#d7aefb',
        },
        {
            id: 4,
            title: 'Trashed Note',
            content: 'This note is in trash',
            pinned: false,
            archived: false,
            trashed: true,
            color: '#f28b82',
        },
    ]);

    const [labels, setLabels] = useState<Label[]>([
        { id: 1, name: 'Work' },
        { id: 2, name: 'Personal' },
    ]);

    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const togglePin = (id: number) => {
        setNotes(
            notes.map((note) =>
                note.id === id ? { ...note, pinned: !note.pinned } : note
            )
        );
    };

    const toggleArchive = (id: number) => {
        setNotes(
            notes.map((note) =>
                note.id === id
                    ? { ...note, archived: !note.archived, pinned: false }
                    : note
            )
        );
    };

    const moveToTrash = (id: number) => {
        setNotes(
            notes.map((note) =>
                note.id === id
                    ? { ...note, trashed: true, pinned: false, archived: false }
                    : note
            )
        );
    };

    const restoreNote = (id: number) => {
        setNotes(
            notes.map((note) =>
                note.id === id ? { ...note, trashed: false } : note
            )
        );
    };

    const deleteNote = (id: number) => {
        setNotes(notes.filter((note) => note.id !== id));
    };

    const cloneNote = (id: number) => {
        const noteToClone = notes.find((note) => note.id === id);
        if (noteToClone) {
            const newNote = {
                ...noteToClone,
                id: Math.max(...notes.map((n) => n.id)) + 1,
                pinned: false,
            };
            setNotes([...notes, newNote]);
        }
    };

    const changeColor = (id: number, color: string) => {
        setNotes(
            notes.map((note) => (note.id === id ? { ...note, color } : note))
        );
    };

    const openNote = (note: Note) => {
        setEditingNote(note);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingNote(null);
    };

    const saveNote = () => {
        if (editingNote) {
            setNotes(
                notes.map((note) =>
                    note.id === editingNote.id ? editingNote : note
                )
            );
            closeModal();
        }
    };

    const pinnedNotes = notes.filter(
        (note) => note.pinned && !note.archived && !note.trashed
    );
    const unpinnedNotes = notes.filter(
        (note) => !note.pinned && !note.archived && !note.trashed
    );
    const archivedNotes = notes.filter(
        (note) => note.archived && !note.trashed
    );
    const trashedNotes = notes.filter((note) => note.trashed);

    return (
        <div className='notes-container'>
            <div className='notes-actions'>
                <button
                    className={`view-toggle ${
                        viewType === 'grid' ? 'active' : ''
                    }`}
                    onClick={() => setViewType('grid')}
                >
                    Grid View
                </button>
                <button
                    className={`view-toggle ${
                        viewType === 'list' ? 'active' : ''
                    }`}
                    onClick={() => setViewType('list')}
                >
                    List View
                </button>
            </div>

            {pinnedNotes.length > 0 && (
                <div className='notes-section'>
                    <h3 className='section-title'>Pinned Notes</h3>
                    <div className={`notes-list ${viewType}`}>
                        {pinnedNotes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onPinToggle={togglePin}
                                onArchiveToggle={toggleArchive}
                                onTrash={moveToTrash}
                                onEdit={openNote}
                                onChangeColor={changeColor}
                                onClone={cloneNote}
                            />
                        ))}
                    </div>
                </div>
            )}

            {unpinnedNotes.length > 0 && (
                <div className='notes-section'>
                    <h3 className='section-title'>Other Notes</h3>
                    <div className={`notes-list ${viewType}`}>
                        {unpinnedNotes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onPinToggle={togglePin}
                                onArchiveToggle={toggleArchive}
                                onTrash={moveToTrash}
                                onEdit={openNote}
                                onChangeColor={changeColor}
                                onClone={cloneNote}
                            />
                        ))}
                    </div>
                </div>
            )}

            {archivedNotes.length > 0 && (
                <div className='notes-section'>
                    <h3 className='section-title'>Archived Notes</h3>
                    <div className={`notes-list ${viewType}`}>
                        {archivedNotes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onPinToggle={togglePin}
                                onArchiveToggle={toggleArchive}
                                onTrash={moveToTrash}
                                onEdit={openNote}
                                onChangeColor={changeColor}
                                onClone={cloneNote}
                            />
                        ))}
                    </div>
                </div>
            )}

            {trashedNotes.length > 0 && (
                <div className='notes-section'>
                    <h3 className='section-title'>Trashed Notes</h3>
                    <div className={`notes-list ${viewType}`}>
                        {trashedNotes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onRestore={() => restoreNote(note.id)}
                                onDelete={() => deleteNote(note.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {isModalOpen && editingNote && (
                <div
                    className='modal-overlay'
                    onClick={closeModal}
                >
                    <div
                        className='modal-content'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Edit Note</h2>
                        <input
                            className='modal-input'
                            value={editingNote.title}
                            onChange={(e) =>
                                setEditingNote({
                                    ...editingNote,
                                    title: e.target.value,
                                })
                            }
                            placeholder='Title'
                        />
                        <textarea
                            className='modal-textarea'
                            value={editingNote.content}
                            onChange={(e) =>
                                setEditingNote({
                                    ...editingNote,
                                    content: e.target.value,
                                })
                            }
                            placeholder='Take a note...'
                            rows={8}
                        />
                        <div className='modal-actions'>
                            <button
                                className='modal-button save'
                                onClick={saveNote}
                            >
                                Save
                            </button>
                            <button
                                className='modal-button cancel'
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

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
}: {
    note: Note;
    onPinToggle?: (id: number) => void;
    onArchiveToggle?: (id: number) => void;
    onTrash?: (id: number) => void;
    onRestore?: () => void;
    onDelete?: () => void;
    onEdit?: (note: Note) => void;
    onChangeColor?: (id: number, color: string) => void;
    onClone?: (id: number) => void;
}) => {
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
                <h4 onClick={handleEditClick}>{note.title}</h4>
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
                <p>{note.content}</p>
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
                            onClick={onRestore}
                            aria-label='Restore note'
                        >
                            <MdRestoreFromTrash size={18} />
                        </button>
                        <button
                            className='action-button delete'
                            onClick={onDelete}
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

export default DummyNotes;
