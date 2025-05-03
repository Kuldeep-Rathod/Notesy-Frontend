'use client';

// components/NoteInput.tsx
import { LabelI } from '@/interfaces/labels';
import { CheckboxI, NoteI } from '@/interfaces/notes';
import { bgColors, bgImages } from '@/interfaces/tooltip';
import '@/styles/components/_noteInput.scss';
import { NoteInputProps } from '@/types/types';
import {
    Archive,
    Bell,
    BookImage,
    Brush,
    EllipsisVertical,
    ImagePlus,
    Palette,
    PinIcon,
    Redo2,
    SquareCheck,
    Trash2,
    Undo2,
    UserPlus,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MdRestoreFromTrash } from 'react-icons/md';

export default function NoteInput({
    isEditing = false,
    noteToEdit,
}: NoteInputProps) {
    // Refs
    const mainRef = useRef<HTMLDivElement>(null);
    const notePlaceholderRef = useRef<HTMLDivElement>(null);
    const noteMainRef = useRef<HTMLDivElement>(null);
    const noteContainerRef = useRef<HTMLDivElement>(null);
    const noteTitleRef = useRef<HTMLDivElement>(null);
    const noteBodyRef = useRef<HTMLDivElement>(null);
    const notePinRef = useRef<HTMLDivElement>(null);
    const cboxInputRef = useRef<HTMLDivElement>(null);
    const cboxPhRef = useRef<HTMLDivElement>(null);

    // State
    const [checkBoxes, setCheckBoxes] = useState<CheckboxI[]>([]);
    const [labels, setLabels] = useState<LabelI[]>([]);
    const [isArchived, setIsArchived] = useState(false);
    const [isTrashed, setIsTrashed] = useState(false);
    const [isCboxCompletedListCollapsed, setIsCboxCompletedListCollapsed] =
        useState(false);
    const [isCbox, setIsCbox] = useState(false);
    const [inputLength, setInputLength] = useState({
        title: 0,
        body: 0,
        cb: 0,
    });

    // Tooltip states
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [colorMenuOpen, setColorMenuOpen] = useState(false);
    const [labelMenuOpen, setLabelMenuOpen] = useState(false);

    // Toggle note visibility
    const toggleNoteVisibility = useCallback((condition: boolean) => {
        if (notePlaceholderRef.current && noteMainRef.current) {
            notePlaceholderRef.current.hidden = condition;
            noteMainRef.current.hidden = !condition;
        }
    }, []);

    // Handle placeholder click
    const notePhClick = useCallback(() => {
        toggleNoteVisibility(true);
        if (isCbox) {
            cboxPhRef.current?.focus();
        } else {
            noteBodyRef.current?.focus();
        }

        if (!isEditing) {
            setInputLength({ title: 0, body: 0, cb: 0 });
            document.addEventListener('mousedown', mouseDownEvent);
        }

        // Clone labels
        // setLabels(JSON.parse(JSON.stringify(labelsList)));
    }, [isCbox, isEditing, toggleNoteVisibility]);

    // Mouse down event handler
    const mouseDownEvent = useCallback(
        (event: MouseEvent) => {
            if (isEditing) return;

            const el = mainRef.current;
            const isTooltipOpen = document.querySelector(
                '[data-is-tooltip-open="true"]'
            );

            if (isTooltipOpen !== null) {
                if (!el?.contains(event.target as Node)) {
                    // Handle tooltip close
                }
            } else if (!el?.contains(event.target as Node)) {
                saveNote();
                closeNote();
            }
        },
        [isEditing]
    );

    // Close note
    const closeNote = useCallback(() => {
        toggleNoteVisibility(false);
        document.removeEventListener('mousedown', mouseDownEvent);
        reset();
    }, [mouseDownEvent, toggleNoteVisibility]);

    // Save note
    const saveNote = useCallback(async () => {
        cboxInputRef.current?.blur();

        if (
            !noteTitleRef.current ||
            !noteContainerRef.current ||
            !noteMainRef.current
        )
            return;

        const noteObj: NoteI = {
            noteTitle: noteTitleRef.current.innerHTML,
            noteBody: noteBodyRef.current?.innerHTML || '',
            pinned: notePinRef.current?.dataset.pinned === 'true',
            bgColor: noteMainRef.current.style.backgroundColor,
            bgImage: noteContainerRef.current.style.backgroundImage,
            checkBoxes,
            isCbox,
            labels: labels.filter((x) => x.added),
            archived: isArchived,
            trashed: isTrashed,
        };

        if (
            noteObj.noteTitle.length ||
            noteObj.noteBody?.length ||
            checkBoxes.length
        ) {
            if (isEditing) {
                // Update note
                console.log('Updating note:', noteObj);
            } else {
                // Add new note
                console.log('Adding new note:', noteObj);
                if (isArchived) {
                    console.log('Note archived');
                }
                if (isTrashed) {
                    console.log('Note trashed');
                }
                closeNote();
            }
        }
    }, [
        checkBoxes,
        isArchived,
        isCbox,
        isEditing,
        isTrashed,
        labels,
        closeNote,
    ]);

    // Reset note
    const reset = useCallback(() => {
        if (noteTitleRef.current) noteTitleRef.current.innerHTML = '';
        if (noteBodyRef.current) noteBodyRef.current.innerHTML = '';
        if (notePinRef.current) notePinRef.current.dataset.pinned = 'false';
        if (noteContainerRef.current)
            noteContainerRef.current.style.backgroundImage = '';
        if (noteMainRef.current) {
            noteMainRef.current.style.backgroundColor = '';
            noteMainRef.current.style.borderColor = '';
        }

        setCheckBoxes([]);
        setIsCbox(false);
        setIsArchived(false);
        setIsTrashed(false);
        setIsCboxCompletedListCollapsed(false);
        setInputLength({ title: 0, body: 0, cb: 0 });
    }, []);

    // Paste event handler
    const pasteEvent = useCallback((event: React.ClipboardEvent) => {
        event.preventDefault();
        const text = event.clipboardData?.getData('text/plain');
        const target = event.target as HTMLDivElement;

        if (text) {
            target.innerText += text;
            const sel = window.getSelection();
            sel?.selectAllChildren(target);
            sel?.collapseToEnd();
        }
    }, []);

    // Checkbox placeholder key down
    const cboxPhKeyDown = useCallback((event: React.KeyboardEvent) => {
        event.preventDefault();
        const isLetter =
            /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"²^\\|,.<>\/?éèçµ]$/i.test(
                event.key
            );

        if (!isLetter) return;

        const enteredValue = event.key;
        addCheckBox(enteredValue);

        const el = document.querySelector(`[data-cbox-last="true"]`);
        const sel = window.getSelection();
        if (el) sel?.selectAllChildren(el);
        sel?.collapseToEnd();
    }, []);

    // Add checkbox
    const addCheckBox = useCallback(
        (data: string) => {
            setCheckBoxes((prev) => [
                ...prev,
                {
                    done: false,
                    data: data,
                    id: prev.length,
                },
            ]);
            setInputLength((prev) => ({ ...prev, cb: checkBoxes.length + 1 }));
        },
        [checkBoxes.length]
    );

    // Checkbox key down
    const cBoxKeyDown = useCallback(
        (event: React.KeyboardEvent, id: number) => {
            const target = event.target as HTMLDivElement;

            if (event.key === 'Enter') {
                event.preventDefault();
                cboxPhRef.current?.focus();
            }

            if (event.key === 'Backspace' && target.innerText.length === 0) {
                cboxPhRef.current?.focus();
                cboxTools(id).remove();
            }
        },
        []
    );

    // Checkbox tools
    const cboxTools = useCallback(
        (id: number) => {
            const actions = {
                remove: () => {
                    setCheckBoxes((prev) => prev.filter((cb) => cb.id !== id));
                    setInputLength((prev) => ({
                        ...prev,
                        cb: checkBoxes.length - 1,
                    }));
                },
                check: () => {
                    setCheckBoxes((prev) =>
                        prev.map((cb) =>
                            cb.id === id ? { ...cb, done: !cb.done } : cb
                        )
                    );
                },
                update: (el: HTMLDivElement) => {
                    const elValue = el.innerHTML;
                    setCheckBoxes((prev) =>
                        prev.map((cb) =>
                            cb.id === id ? { ...cb, data: elValue } : cb
                        )
                    );
                },
            };
            return actions;
        },
        [checkBoxes.length]
    );

    // More menu actions
    const moreMenu = {
        trash: () => {
            if (isEditing) {
                console.log('Trashing note');
                // Close modal if needed
            } else {
                setIsTrashed(true);
                saveNote();
            }
        },
        clone: () => {
            saveNote();
        },
        toggleCbox: () => {
            setIsCbox((prev) => !prev);
        },
    };

    // Color menu actions
    const colorMenu = {
        bgColor: (color: string) => {
            if (noteMainRef.current) {
                noteMainRef.current.style.backgroundColor = color;
                noteMainRef.current.style.borderColor = color;
            }
        },
        bgImage: (image: string) => {
            if (noteContainerRef.current) {
                noteContainerRef.current.style.backgroundImage = image;
            }
        },
    };

    // Update input length
    const updateInputLength = useCallback(
        (type: { title?: number; body?: number; cb?: number }) => {
            setInputLength((prev) => ({
                ...prev,
                ...(type.title !== undefined && { title: type.title }),
                ...(type.body !== undefined && { body: type.body }),
                ...(type.cb !== undefined && { cb: type.cb }),
            }));
        },
        []
    );

    // Initialize for editing
    useEffect(() => {
        if (isEditing && noteToEdit) {
            notePhClick();

            if (noteTitleRef.current)
                noteTitleRef.current.innerHTML = noteToEdit.noteTitle;
            if (noteBodyRef.current)
                noteBodyRef.current.innerHTML = noteToEdit.noteBody || '';
            if (notePinRef.current)
                notePinRef.current.dataset.pinned = String(noteToEdit.pinned);
            if (noteContainerRef.current)
                noteContainerRef.current.style.backgroundImage =
                    noteToEdit.bgImage;
            if (noteMainRef.current) {
                noteMainRef.current.style.backgroundColor = noteToEdit.bgColor;
                noteMainRef.current.style.borderColor = noteToEdit.bgColor;
            }

            setCheckBoxes(noteToEdit.checkBoxes || []);
            setIsCbox(noteToEdit.isCbox);
            setIsArchived(noteToEdit.archived);
            setIsTrashed(noteToEdit.trashed);

            setInputLength({
                title: noteToEdit.noteTitle.length,
                body: noteToEdit.noteBody?.length || 0,
                cb: noteToEdit.checkBoxes?.length || 0,
            });

            // Initialize labels
            // const updatedLabels = labelsList.map(label => ({
            //   ...label,
            //   added: noteToEdit.labels.some(noteLabel => noteLabel.name === label.name)
            // }));
            // setLabels(updatedLabels);
        }
    }, [isEditing, noteToEdit, notePhClick]);

    // Effect for isCbox changes
    useEffect(() => {
        // Update more menu checkbox text
    }, [isCbox]);

    // Effect for input length changes
    useEffect(() => {
        // Enable/disable menu items based on input
    }, [inputLength]);

    return (
        <div
            ref={mainRef}
            className={!isEditing ? 'note-input__container' : ''}
        >
            {/* Placeholder */}
            <div
                ref={notePlaceholderRef}
                onClick={notePhClick}
                className='note-input__placeholder'
            >
                <input
                    className='note-input__placeholder-input'
                    placeholder='Take a note…'
                    type='text'
                />
                <div
                    className={`note-input__action-icon note-input__action-icon--check H pop`}
                    data-tooltip='New list'
                    onClick={() => setIsCbox(true)}
                >
                    <SquareCheck style={{ color: 'white' }} />
                </div>
                <div
                    className={`note-input__action-icon note-input__action-icon--paint H disabled pop`}
                    data-tooltip='New note with drawing'
                >
                    <Brush style={{ color: 'white' }} />
                </div>
                <div
                    className={`note-input__action-icon note-input__action-icon--picture H disabled pop`}
                    data-tooltip='New note with image'
                >
                    <BookImage style={{ color: 'white' }} />
                </div>
            </div>

            {/* New note */}
            <div
                ref={noteMainRef}
                className='note-input__editor'
                hidden
            >
                <div
                    ref={noteContainerRef}
                    className='note-input__editor-content'
                >
                    <div
                        hidden={inputLength.title > 0}
                        className={`note-input__title note-input__title--placeholder`}
                    >
                        Title
                    </div>
                    <div
                        ref={noteTitleRef}
                        onInput={(e) =>
                            updateInputLength({
                                title: e.currentTarget.innerHTML.length,
                            })
                        }
                        onPaste={pasteEvent}
                        className='note-input__title'
                        contentEditable
                        spellCheck
                    ></div>

                    {/* Note or checkboxes */}
                    {isCbox ? (
                        <>
                            {/* Checkboxes */}
                            {checkBoxes
                                .filter((cb) => !cb.done)
                                .map((cb, index) => (
                                    <div
                                        key={cb.id}
                                        className='note-input__checkbox-container'
                                    >
                                        <div className='note-input__checkbox-move-icon'></div>
                                        <div
                                            className={`note-input__checkbox-icon ${
                                                cb.done
                                                    ? 'note-input__checkbox-icon--checked'
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                cboxTools(cb.id).check()
                                            }
                                        ></div>
                                        <div className='note-input__checkbox-content'>
                                            <div
                                                ref={
                                                    index ===
                                                    checkBoxes.length - 1
                                                        ? cboxInputRef
                                                        : null
                                                }
                                                data-cbox-last={
                                                    index ===
                                                    checkBoxes.length - 1
                                                }
                                                className={`note-input__checkbox-item ${
                                                    cb.done
                                                        ? 'note-input__checkbox-item--completed'
                                                        : ''
                                                }`}
                                                contentEditable
                                                spellCheck
                                                onBlur={(e) =>
                                                    cboxTools(cb.id).update(
                                                        e.currentTarget
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    cBoxKeyDown(e, cb.id)
                                                }
                                                dangerouslySetInnerHTML={{
                                                    __html: cb.data,
                                                }}
                                            ></div>
                                        </div>
                                        <div
                                            className={`note-input__checkbox-remove H`}
                                            onClick={() =>
                                                cboxTools(cb.id).remove()
                                            }
                                        ></div>
                                    </div>
                                ))}

                            {/* Checkbox placeholder */}
                            <div className='note-input__checkbox-placeholder'>
                                <div className='note-input__checkbox-placeholder-icon'></div>
                                <div className='note-input__checkbox-content'>
                                    <div
                                        className={`note-input__checkbox-item note-input__checkbox-item--placeholder`}
                                    >
                                        List item
                                    </div>
                                    <div
                                        ref={cboxPhRef}
                                        onKeyDown={cboxPhKeyDown}
                                        className='note-input__checkbox-item'
                                        contentEditable
                                        spellCheck
                                    ></div>
                                </div>
                            </div>

                            {/* Completed checkboxes */}
                            {checkBoxes.filter((cb) => cb.done).length > 0 && (
                                <>
                                    <div className='note-input__checkbox-divider'></div>
                                    <div
                                        className='note-input__checkbox-completed-header'
                                        onClick={() =>
                                            setIsCboxCompletedListCollapsed(
                                                (prev) => !prev
                                            )
                                        }
                                    >
                                        <div
                                            className={`note-input__checkbox-toggle ${
                                                !isCboxCompletedListCollapsed
                                                    ? 'note-input__checkbox-toggle--expanded'
                                                    : ''
                                            }`}
                                        ></div>
                                        <div>
                                            <span>
                                                (
                                                {
                                                    checkBoxes.filter(
                                                        (cb) => cb.done
                                                    ).length
                                                }
                                                ) Completed item
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Show completed checkboxes if not collapsed */}
                            {!isCboxCompletedListCollapsed &&
                                checkBoxes
                                    .filter((cb) => cb.done)
                                    .map((cb, index) => (
                                        <div
                                            key={`done-${cb.id}`}
                                            className='note-input__checkbox-container'
                                        >
                                            <div className='note-input__checkbox-move-icon'></div>
                                            <div
                                                className={`note-input__checkbox-icon note-input__checkbox-icon--checked`}
                                                onClick={() =>
                                                    cboxTools(cb.id).check()
                                                }
                                            ></div>
                                            <div className='note-input__checkbox-content'>
                                                <div
                                                    data-cbox-last={
                                                        index ===
                                                        checkBoxes.length - 1
                                                    }
                                                    className={`note-input__checkbox-item note-input__checkbox-item--completed`}
                                                    contentEditable
                                                    spellCheck
                                                    onBlur={(e) =>
                                                        cboxTools(cb.id).update(
                                                            e.currentTarget
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        cBoxKeyDown(e, cb.id)
                                                    }
                                                    dangerouslySetInnerHTML={{
                                                        __html: cb.data,
                                                    }}
                                                ></div>
                                            </div>
                                            <div
                                                className={`note-input__checkbox-remove H`}
                                                onClick={() =>
                                                    cboxTools(cb.id).remove()
                                                }
                                            ></div>
                                        </div>
                                    ))}
                        </>
                    ) : (
                        <>
                            {/* Regular note body */}
                            <div
                                hidden={inputLength.body > 0}
                                className={`note-input__body note-input__body--placeholder`}
                            >
                                Take a note…
                            </div>
                            <div
                                ref={noteBodyRef}
                                onInput={(e) =>
                                    updateInputLength({
                                        body: e.currentTarget.innerHTML.length,
                                    })
                                }
                                onPaste={pasteEvent}
                                className='note-input__body'
                                contentEditable
                                spellCheck
                            ></div>
                        </>
                    )}

                    {/* Labels */}
                    <div className='note-input__labels'>
                        {labels
                            .filter((label) => label.added)
                            .map((label) => (
                                <div
                                    key={label.name}
                                    className='note-input__labels-item'
                                >
                                    <div className='note-input__labels-badge'>
                                        <span>{label.name}</span>
                                        <div
                                            className='note-input__labels-remove'
                                            onClick={() =>
                                                setLabels((prev) =>
                                                    prev.map((l) =>
                                                        l.name === label.name
                                                            ? {
                                                                  ...l,
                                                                  added: false,
                                                              }
                                                            : l
                                                    )
                                                )
                                            }
                                        ></div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Pin icon */}
                <div
                    ref={notePinRef}
                    data-pinned='false'
                    className={`note-input__pin H pop ${
                        notePinRef.current?.dataset.pinned === 'true'
                            ? 'note-input__pin--active'
                            : ''
                    }`}
                    onClick={() => {
                        if (notePinRef.current) {
                            notePinRef.current.dataset.pinned =
                                notePinRef.current.dataset.pinned === 'false'
                                    ? 'true'
                                    : 'false';
                        }
                    }}
                    data-tooltip={
                        notePinRef.current?.dataset.pinned === 'false'
                            ? 'Pin note'
                            : 'Unpin note'
                    }
                >
                    <PinIcon style={{ color: 'white' }} />
                </div>

                {/* Icons */}
                {!isTrashed ? (
                    <div className='note-input__toolbar'>
                        <div className='note-input__toolbar-icons'>
                            <div
                                className={`note-input__toolbar-icon note-input__toolbar-icon--alarm H disabled pop`}
                                data-tooltip='Remind me'
                            >
                                <Bell style={{ color: 'white' }} />
                            </div>
                            <div
                                className={`note-input__toolbar-icon note-input__toolbar-icon--collaborator H disabled pop`}
                                data-tooltip='Collaborator'
                            >
                                <UserPlus style={{ color: 'white' }} />
                            </div>
                            <div
                                className={`note-input__toolbar-icon note-input__toolbar-icon--color H pop`}
                                data-tooltip='Background Options'
                                onClick={() =>
                                    setColorMenuOpen((prev) => !prev)
                                }
                            >
                                <Palette style={{ color: 'white' }} />
                            </div>
                            <div
                                className={`note-input__toolbar-icon note-input__toolbar-icon--image H disabled pop`}
                                data-tooltip='Add image'
                            >
                                <ImagePlus style={{ color: 'white' }} />
                            </div>
                            <div
                                className={`note-input__toolbar-icon note-input__toolbar-icon--archive H pop`}
                                onClick={() => {
                                    setIsArchived(true);
                                    saveNote();
                                }}
                                data-tooltip='Archive'
                            >
                                <Archive style={{ color: 'white' }} />
                            </div>
                            <div
                                className={`note-input__toolbar-icon note-input__toolbar-icon--more H pop`}
                                data-tooltip='More'
                                onClick={() => setMoreMenuOpen((prev) => !prev)}
                            >
                                <EllipsisVertical style={{ color: 'white' }} />
                            </div>
                            <div
                                className={`note-input__toolbar-icon note-input__toolbar-icon--undo disabled pop`}
                                data-tooltip='Undo'
                            >
                                <Undo2 style={{ color: 'white' }} />
                            </div>
                            <div
                                className={`note-input__toolbar-icon note-input__toolbar-icon--redo disabled`}
                                data-tooltip='Redo'
                            >
                                <Redo2 style={{ color: 'white' }} />
                            </div>
                        </div>
                        <div
                            className='note-input__button--close'
                            onClick={saveNote}
                        >
                            Close
                        </div>
                    </div>
                ) : (
                    <div
                        className={`note-input__toolbar note-input__toolbar--minimal`}
                    >
                        <div className='note-input__toolbar-icons'>
                            <div
                                className={`note-input__toolbar-icon note-input__toolbar-icon--delete H`}
                            >
                                <Trash2 style={{ color: 'white' }} />
                            </div>
                            <div
                                className={`note-input__toolbar-icon note-input__toolbar-icon--restore H`}
                            >
                                <MdRestoreFromTrash />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tooltips */}
            {moreMenuOpen && (
                <div
                    className='note-input__menu'
                    data-tooltip='true'
                    data-is-tooltip-open='true'
                >
                    <div
                        onClick={() => {
                            moreMenu.trash();
                            setMoreMenuOpen(false);
                        }}
                    >
                        Delete note
                    </div>
                    <div
                        onClick={() => {
                            setMoreMenuOpen(false);
                            setLabelMenuOpen(true);
                        }}
                    >
                        Add label
                    </div>
                    <div
                        onClick={() => {
                            moreMenu.clone();
                            setMoreMenuOpen(false);
                        }}
                    >
                        Make a copy
                    </div>
                    <div
                        onClick={() => {
                            moreMenu.toggleCbox();
                            setMoreMenuOpen(false);
                        }}
                    >
                        {isCbox ? 'Hide checkboxes' : 'Show checkboxes'}
                    </div>
                </div>
            )}

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
                                    setColorMenuOpen(false);
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
                                    setColorMenuOpen(false);
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

            {labelMenuOpen && (
                <div
                    className='note-input__label-menu'
                    data-tooltip='true'
                    data-is-tooltip-open='true'
                >
                    <div className='note-input__label-menu-title'>
                        Label note
                    </div>
                    <div className='note-input__label-menu-search'>
                        <input
                            type='text'
                            maxLength={50}
                            placeholder='Enter label name'
                        />
                        <div className='note-input__label-menu-search-icon'></div>
                    </div>
                    <div className='note-input__label-menu-list'>
                        {labels.map((label) => (
                            <div
                                key={label.name}
                                className='note-input__label-menu-item'
                                onClick={() =>
                                    setLabels((prev) =>
                                        prev.map((l) =>
                                            l.name === label.name
                                                ? { ...l, added: !l.added }
                                                : l
                                        )
                                    )
                                }
                            >
                                <div
                                    className={`note-input__label-menu-check ${
                                        label.added
                                            ? 'note-input__label-menu-check--active'
                                            : ''
                                    }`}
                                ></div>
                                <div className='note-input__label-menu-name'>
                                    {label.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
