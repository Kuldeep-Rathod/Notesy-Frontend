'use client';

// components/NoteInput.tsx
import { LabelI } from '@/interfaces/labels';
import { CheckboxI, NoteI } from '@/interfaces/notes';
import { bgColors, bgImages } from '@/interfaces/tooltip';
import {
    useCreateNoteMutation,
    useUpdateNoteMutation,
} from '@/redux/api/notesAPI';
import '@/styles/components/notes/_noteInput.scss';
import { NoteInputProps } from '@/types/types';
import { BookImage, Brush, SquareCheck } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BsPin, BsPinFill } from 'react-icons/bs';
import { CheckboxList } from './input/CheckboxList';
import { NoteToolbar } from './input/NoteToolbar';
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition';

export default function NoteInput({
    isEditing = false,
    noteToEdit,
    onSuccess,
}: NoteInputProps) {
    const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
    const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();

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
    const labelSearchRef = useRef<HTMLInputElement>(null);

    // State
    const [checklists, setChecklists] = useState<CheckboxI[]>([]);
    const [labels, setLabels] = useState<LabelI[]>([]);
    const [availableLabels, setAvailableLabels] = useState<LabelI[]>([]);
    const [isArchived, setIsArchived] = useState(false);
    const [isTrashed, setIsTrashed] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [isCboxCompletedListCollapsed, setIsCboxCompletedListCollapsed] =
        useState(false);
    const [isCbox, setIsCbox] = useState(false);
    const [inputLength, setInputLength] = useState({
        title: 0,
        body: 0,
        cb: 0,
    });
    const [activeField, setActiveField] = useState<'title' | 'body' | null>(
        null
    );
    const [searchQuery, setSearchQuery] = useState('');

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

    const handlePinClick = () => {
        setIsPinned((prev) => !prev);
        if (notePinRef.current) {
            notePinRef.current.dataset.pinned = (!isPinned).toString();
        }
    };

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
            checklists,
            isCbox,
            labels: labels.filter((x) => x.added),
            archived: isArchived,
            trashed: isTrashed,
        };

        if (
            noteObj.noteTitle?.length ||
            noteObj.noteBody?.length ||
            checklists.length
        ) {
            try {
                if (isEditing && noteToEdit?._id) {
                    await updateNote({
                        id: noteToEdit._id.toString(),
                        updates: noteObj,
                    }).unwrap();
                    console.log('Note updated successfully');
                    onSuccess?.();
                } else {
                    await createNote(noteObj).unwrap();
                    console.log('Note created successfully');
                    onSuccess?.();

                    if (isArchived) {
                        console.log('Note archived');
                    }
                    if (isTrashed) {
                        console.log('Note trashed');
                    }

                    if (!isEditing) {
                        closeNote();
                    }
                }
            } catch (error) {
                console.error('Error saving note:', error);
            }
        }
    }, [
        checklists,
        isArchived,
        isCbox,
        isEditing,
        isTrashed,
        labels,
        closeNote,
        noteToEdit?._id,
        onSuccess,
        createNote,
        updateNote,
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

        setChecklists([]);
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
            setChecklists((prev) => [
                ...prev,
                {
                    checked: false,
                    text: data,
                    id: prev.length,
                },
            ]);
            setInputLength((prev) => ({ ...prev, cb: checklists.length + 1 }));
        },
        [checklists.length]
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
                    setChecklists((prev) => prev.filter((cb) => cb.id !== id));
                    setInputLength((prev) => ({
                        ...prev,
                        cb: checklists.length - 1,
                    }));
                },
                check: () => {
                    setChecklists((prev) =>
                        prev.map((cb) =>
                            cb.id === id ? { ...cb, done: !cb.checked } : cb
                        )
                    );
                },
                update: (el: HTMLDivElement) => {
                    const elValue = el.innerHTML;
                    setChecklists((prev) =>
                        prev.map((cb) =>
                            cb.id === id ? { ...cb, data: elValue } : cb
                        )
                    );
                },
            };
            return actions;
        },
        [checklists.length]
    );

    // More menu actions
    const moreMenu = {
        trash: () => {
            if (isEditing) {
                console.log('Trashing note');
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

    // Toggle label
    const toggleLabel = (labelName: string) => {
        setLabels((prev) =>
            prev.map((label) =>
                label.name === labelName
                    ? { ...label, added: !label.added }
                    : label
            )
        );
    };

    // Add new label
    const addNewLabel = () => {
        if (
            searchQuery.trim() &&
            !labels.some((label) => label.name === searchQuery.trim())
        ) {
            const newLabel = {
                name: searchQuery.trim(),
                added: true,
            };
            setLabels((prev) => [...prev, newLabel]);
            setSearchQuery('');
            if (labelSearchRef.current) {
                labelSearchRef.current.value = '';
            }
        }
    };

    // Handle label search key down
    const handleLabelSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            addNewLabel();
        }
    };

    // Initialize for editing
    useEffect(() => {
        if (isEditing && noteToEdit) {
            notePhClick();

            if (noteTitleRef.current)
                noteTitleRef.current.innerHTML = noteToEdit.noteTitle || '';
            if (noteBodyRef.current)
                noteBodyRef.current.innerHTML = noteToEdit.noteBody || '';
            if (notePinRef.current)
                notePinRef.current.dataset.pinned = String(noteToEdit.pinned);
            if (noteContainerRef.current)
                noteContainerRef.current.style.backgroundImage =
                    noteToEdit.bgImage || '';
            if (noteMainRef.current) {
                noteMainRef.current.style.backgroundColor =
                    noteToEdit.bgColor || '';
                noteMainRef.current.style.borderColor =
                    noteToEdit.bgColor || '';
            }

            setChecklists(noteToEdit.checklists || []);
            setIsCbox(noteToEdit.isCbox || false);
            setIsArchived(noteToEdit.archived || false);
            setIsTrashed(noteToEdit.trashed || false);

            setInputLength({
                title: noteToEdit.noteTitle?.length || 0,
                body: noteToEdit.noteBody?.length || 0,
                cb: noteToEdit.checklists?.length || 0,
            });

            // Initialize labels
            if (noteToEdit.labels) {
                const initialLabels = noteToEdit.labels.map(label => {
                    if (typeof label === 'string') {
                        return { name: label, added: true };
                    }
                    return { name: label.name, added: true };
                });
                setLabels(initialLabels);
            }
        }

        // Fetch available labels (this would typically come from an API)
        // For demo purposes, we'll use some sample labels
        const fetchAvailableLabels = async () => {
            // In a real app, you would fetch these from your API
            const sampleLabels = [
                { name: 'Work', added: false },
                { name: 'Personal', added: false },
                { name: 'Important', added: false },
                { name: 'To-Do', added: false },
                { name: 'Ideas', added: false },
            ];

            // Merge with any existing labels from the note being edited
            if (isEditing && noteToEdit?.labels) {
                const noteLabels = noteToEdit.labels.map(label => {
                    if (typeof label === 'string') {
                        return { name: label, added: true };
                    }
                    return { name: label.name, added: true };
                });

                // Combine and remove duplicates
                const combined = [...noteLabels, ...sampleLabels].filter(
                    (label, index, self) =>
                        index === self.findIndex((l) => l.name === label.name)
                );

                setLabels(combined);
                setAvailableLabels(combined);
            } else {
                setLabels(sampleLabels);
                setAvailableLabels(sampleLabels);
            }
        };

        fetchAvailableLabels();
    }, [isEditing, noteToEdit, notePhClick]);

    const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
        useSpeechRecognition();
    const [isListening, setIsListening] = useState(false);

    const startListening = () => {
        setIsListening(true);
        SpeechRecognition.startListening({
            continuous: true,
            language: 'en-IN',
        });
    };

    const stopListening = () => {
        setIsListening(false);
        SpeechRecognition.stopListening();
    };

    useEffect(() => {
        if (!isListening || !transcript || !activeField) return;

        const fieldRef = activeField === 'title' ? noteTitleRef : noteBodyRef;
        if (!fieldRef.current) return;

        const selection = window.getSelection();
        const hadSelection =
            selection?.rangeCount &&
            selection.getRangeAt(0).collapsed === false;

        fieldRef.current.textContent = transcript;
        updateInputLength({ [activeField]: transcript.length });

        if (hadSelection) {
            const range = document.createRange();
            range.selectNodeContents(fieldRef.current);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    }, [transcript, isListening, activeField]);

    if (!browserSupportsSpeechRecognition) {
        return <p>Browser doesnt support speech recognition.</p>;
    }

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
                    <SquareCheck />
                </div>
                <div
                    className={`note-input__action-icon note-input__action-icon--paint H disabled pop`}
                    data-tooltip='New note with drawing'
                >
                    <Brush />
                </div>
                <div
                    className={`note-input__action-icon note-input__action-icon--picture H disabled pop`}
                    data-tooltip='New note with image'
                >
                    <BookImage />
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
                        onFocus={() => {
                            setActiveField('title');
                            resetTranscript();
                        }}
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

                    {/* Note or checklists */}
                    {isCbox ? (
                        <>
                            {/* checklists */}
                            <CheckboxList
                                checklists={checklists}
                                isCompletedCollapsed={
                                    isCboxCompletedListCollapsed
                                }
                                onToggleCollapse={() =>
                                    setIsCboxCompletedListCollapsed(
                                        (prev) => !prev
                                    )
                                }
                                onCheckboxChange={(id) => cboxTools(id).check()}
                                onCheckboxRemove={(id) =>
                                    cboxTools(id).remove()
                                }
                                onCheckboxUpdate={(id, value) => {
                                    setChecklists((prev) =>
                                        prev.map((cb) =>
                                            cb.id === id
                                                ? { ...cb, data: value }
                                                : cb
                                        )
                                    );
                                }}
                                onKeyDown={cBoxKeyDown}
                            />

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
                            {checklists.filter((cb) => cb.checked).length >
                                0 && (
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
                                                    checklists.filter(
                                                        (cb) => cb.checked
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
                                checklists
                                    .filter((cb) => cb.checked)
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
                                                        checklists.length - 1
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
                                                        __html: cb.text,
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
                                onFocus={() => {
                                    setActiveField('body');
                                    resetTranscript();
                                }}
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

                            <div
                                className='note-input__speech-controls'
                                style={{
                                    marginTop: '10px',
                                    display: 'flex',
                                    gap: '10px',
                                }}
                            >
                                <button onClick={startListening}>
                                    🎙️ Start Speaking
                                </button>
                                <button onClick={stopListening}>🛑 Stop</button>
                                <button onClick={resetTranscript}>
                                    🔁 Clear
                                </button>
                                {isListening && <span>Listening...</span>}
                            </div>
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
                                                toggleLabel(label.name)
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
                    data-pinned={isPinned.toString()}
                    className={`note-input__pin H pop`}
                    onClick={handlePinClick}
                    data-tooltip={isPinned ? 'Unpin note' : 'Pin note'}
                >
                    {isPinned ? <BsPinFill /> : <BsPin />}
                </div>

                {/* Icons */}
                <NoteToolbar
                    isTrashed={isTrashed}
                    onArchive={() => {
                        setIsArchived(true);
                        saveNote();
                    }}
                    onPinToggle={() => {
                        if (notePinRef.current) {
                            notePinRef.current.dataset.pinned =
                                notePinRef.current.dataset.pinned === 'false'
                                    ? 'true'
                                    : 'false';
                        }
                    }}
                    onMoreClick={() => setMoreMenuOpen((prev) => !prev)}
                    onColorClick={() => setColorMenuOpen((prev) => !prev)}
                    pinned={notePinRef.current?.dataset.pinned === 'true'}
                />
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
                            setMoreMenuOpen(false);
                            setLabelMenuOpen(true);
                        }}
                    >
                        Add label
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
                        <p>Label note</p>
                        <p
                            onClick={() => {
                                setLabelMenuOpen(false);
                            }}
                        >
                            X
                        </p>
                    </div>
                    <div className='note-input__label-menu-search'>
                        <input
                            ref={labelSearchRef}
                            type='text'
                            maxLength={50}
                            placeholder='Enter label name'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleLabelSearchKeyDown}
                        />
                        <div
                            className='note-input__label-menu-search-icon'
                            onClick={addNewLabel}
                        >
                            +
                        </div>
                    </div>
                    <div className='note-input__label-menu-list'>
                        {labels
                            .filter(
                                (label) =>
                                    label.name
                                        .toLowerCase()
                                        .includes(searchQuery.toLowerCase()) ||
                                    searchQuery === ''
                            )
                            .map((label) => (
                                <div
                                    key={label.name}
                                    className='note-input__label-menu-item'
                                    onClick={() => toggleLabel(label.name)}
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
