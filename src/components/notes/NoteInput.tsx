'use client';

import { LabelI } from '@/interfaces/labels';
import { CheckboxI, NoteI } from '@/interfaces/notes';
import {
    useAddLabelMutation,
    useAttachLabelsToNoteMutation,
    useGetLabelsQuery,
} from '@/redux/api/labelsAPI';
import {
    useCreateNoteMutation,
    useShareNoteMutation,
    useUpdateNoteMutation,
} from '@/redux/api/notesAPI';
import {
    addChecklist,
    removeChecklist,
    resetNoteInput,
    selectNoteInput,
    setActiveField,
    setAvailableLabels,
    setChecklists,
    setLabels,
    setListening,
    setSearchQuery,
    toggleArchive,
    toggleCbox,
    toggleCboxCompletedList,
    toggleLabel,
    toggleLabelMenu,
    togglePinned,
    toggleTrash,
    updateChecklist,
    updateInputLength,
} from '@/redux/reducer/noteInputReducer';
import '@/styles/components/notes/_noteInput.scss';
import { NoteInputProps } from '@/types/types';
import { BookImage, Brush, SquareCheck } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { BsPin, BsPinFill } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition';
import { CheckboxList } from './input/CheckboxList';
import NoteToolbar from './input/NoteToolbar';

export default function NoteInput({
    isEditing = false,
    noteToEdit,
    onSuccess,
}: NoteInputProps) {
    const dispatch = useDispatch();

    // Redux state
    const {
        checklists,
        labels,
        availableLabels,
        isArchived,
        isTrashed,
        isPinned,
        reminder,
        isCbox,
        isCboxCompletedListCollapsed,
        isListening,
        transcript,
        activeField,
        inputLength,
        tooltips: { labelMenuOpen },
        searchQuery,
        noteAppearance: { bgColor, bgImage },
        collaborators: { selectedUsers },
    } = useSelector(selectNoteInput);

    const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
    const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
    const [shareNote] = useShareNoteMutation();

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

    // Get labels
    const { data: serverLabels = [], refetch: refetchLabels } =
        useGetLabelsQuery();
    const [addLabel] = useAddLabelMutation();
    const [attachLabelsToNote] = useAttachLabelsToNoteMutation();

    // Toggle note visibility
    const toggleNoteVisibility = useCallback((condition: boolean) => {
        if (notePlaceholderRef.current && noteMainRef.current) {
            notePlaceholderRef.current.hidden = condition;
            noteMainRef.current.hidden = !condition;
        }
    }, []);

    const handlePinClick = () => {
        dispatch(togglePinned());
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
            dispatch(updateInputLength({ title: 0, body: 0, cb: 0 }));
            document.addEventListener('mousedown', mouseDownEvent);
        }
    }, [isCbox, isEditing, toggleNoteVisibility, dispatch]);

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
                closeNote();
            }
        },
        [isEditing]
    );

    useEffect(() => {
        if (isArchived) {
            saveNote();
        }
    }, [isArchived]);

    // Close note
    const closeNote = useCallback(() => {
        toggleNoteVisibility(false);
        document.removeEventListener('mousedown', mouseDownEvent);
        dispatch(resetNoteInput());

        // Clear the contentEditable divs
        if (noteTitleRef.current) noteTitleRef.current.innerHTML = '';
        if (noteBodyRef.current) noteBodyRef.current.innerHTML = '';
    }, [mouseDownEvent, toggleNoteVisibility, dispatch]);

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
            labels: labels
                .filter((label: LabelI) => label.added)
                .map((label: LabelI) => label.name),
            archived: isArchived,
            trashed: isTrashed,
            reminder: reminder,
        };

        if (
            noteObj.noteTitle?.length ||
            noteObj.noteBody?.length ||
            checklists.length
        ) {
            try {
                let savedNoteId: string | undefined;

                if (isEditing && noteToEdit?._id) {
                    const updatedNote = await updateNote({
                        id: noteToEdit._id.toString(),
                        updates: noteObj,
                    }).unwrap();
                    savedNoteId = updatedNote._id;
                    console.log('Note updated successfully');
                } else {
                    const newNote = await createNote(noteObj).unwrap();
                    savedNoteId = newNote._id;
                    console.log('Note created successfully');
                }

                // Share note if collaborators are selected
                if (savedNoteId && selectedUsers.length > 0) {
                    await shareNote({
                        noteId: savedNoteId,
                        emails: selectedUsers.map((user) => user.email),
                    }).unwrap();
                    console.log('Note shared successfully');
                }

                onSuccess?.();
                dispatch(resetNoteInput());

                // Clear the contentEditable divs explicitly
                if (noteTitleRef.current) noteTitleRef.current.innerHTML = '';
                if (noteBodyRef.current) noteBodyRef.current.innerHTML = '';

                if (!isEditing) {
                    closeNote();
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
        shareNote,
        selectedUsers,
        reminder,
    ]);

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
    const cboxPhKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            event.preventDefault();
            const isLetter =
                /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"²^\\|,.<>\/?éèçµ]$/i.test(
                    event.key
                );

            if (!isLetter) return;

            const enteredValue = event.key;
            dispatch(
                addChecklist({
                    checked: false,
                    text: enteredValue,
                    id: checklists.length,
                })
            );
            dispatch(updateInputLength({ cb: checklists.length + 1 }));

            const el = document.querySelector(`[data-cbox-last="true"]`);
            const sel = window.getSelection();
            if (el) sel?.selectAllChildren(el);
            sel?.collapseToEnd();
        },
        [checklists.length, dispatch]
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
                dispatch(removeChecklist(id));
                dispatch(updateInputLength({ cb: checklists.length - 1 }));
            }
        },
        [checklists.length, dispatch]
    );

    // Checkbox tools
    const cboxTools = useCallback(
        (id: number) => {
            const actions = {
                remove: () => {
                    dispatch(removeChecklist(id));
                    dispatch(updateInputLength({ cb: checklists.length - 1 }));
                },
                check: () => {
                    const checkbox = checklists.find(
                        (cb: CheckboxI) => cb.id === id
                    );
                    if (checkbox) {
                        dispatch(
                            updateChecklist({
                                id,
                                updates: { checked: !checkbox.checked },
                            })
                        );
                    }
                },
                update: (el: HTMLDivElement) => {
                    const elValue = el.innerHTML;
                    dispatch(
                        updateChecklist({
                            id,
                            updates: { text: elValue },
                        })
                    );
                },
            };
            return actions;
        },
        [checklists, dispatch]
    );

    // Update labels state when server labels change
    useEffect(() => {
        if (serverLabels) {
            const formattedLabels: LabelI[] = serverLabels.map((labelName) => ({
                name: labelName,
                added:
                    (isEditing &&
                        noteToEdit?.labels?.some((noteLabel) =>
                            typeof noteLabel === 'string'
                                ? noteLabel === labelName
                                : noteLabel.name === labelName
                        )) ||
                    false,
            }));

            dispatch(setLabels(formattedLabels));
            dispatch(setAvailableLabels(formattedLabels));
        }
    }, [JSON.stringify(serverLabels), isEditing, JSON.stringify(noteToEdit)]); // safer deep compare

    // Toggle label
    const handleToggleLabel = async (labelName: string) => {
        const label: LabelI | undefined = labels.find(
            (l: LabelI) => l.name === labelName
        );
        if (!label) return;

        try {
            if (!label.added) {
                // Attach label to note
                if (isEditing && noteToEdit?._id) {
                    await attachLabelsToNote({
                        id: noteToEdit._id.toString(),
                        labels: labelName,
                    }).unwrap();
                }
            }
            dispatch(toggleLabel(labelName));
        } catch (error) {
            console.error('Error toggling label:', error);
        }
    };

    // Add new label
    const addNewLabel = async () => {
        if (
            searchQuery.trim() &&
            !labels.some((label: LabelI) => label.name === searchQuery.trim())
        ) {
            try {
                await addLabel(searchQuery.trim()).unwrap();

                // Add the new label to the list
                const newLabel: LabelI = {
                    name: searchQuery.trim(),
                    added: true,
                };

                dispatch(setLabels([...labels, newLabel]));
                dispatch(setSearchQuery(''));
                if (labelSearchRef.current) {
                    labelSearchRef.current.value = '';
                }

                // If editing, attach the new label to the note
                if (isEditing && noteToEdit?._id) {
                    await attachLabelsToNote({
                        id: noteToEdit._id.toString(),
                        labels: searchQuery.trim(),
                    }).unwrap();
                }
            } catch (error) {
                console.error('Error adding new label:', error);
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

            dispatch(setChecklists(noteToEdit.checklists || []));
            if (noteToEdit.isCbox) {
                dispatch(toggleCbox());
            }
            dispatch(toggleArchive());
            dispatch(toggleTrash());

            dispatch(
                updateInputLength({
                    title: noteToEdit.noteTitle?.length || 0,
                    body: noteToEdit.noteBody?.length || 0,
                    cb: noteToEdit.checklists?.length || 0,
                })
            );

            // Initialize labels
            if (noteToEdit.labels) {
                const initialLabels = noteToEdit.labels.map((label) => {
                    if (typeof label === 'string') {
                        return { name: label, added: true };
                    }
                    return { name: label.name, added: true };
                });
                dispatch(setLabels(initialLabels));
            }
        }
    }, [isEditing, noteToEdit, notePhClick, dispatch]);

    const {
        transcript: speechTranscript,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    const startListening = useCallback(() => {
        dispatch(setListening(true));
        SpeechRecognition.startListening({
            continuous: true,
            language: 'en-IN',
        });
    }, [dispatch]);

    const stopListening = useCallback(() => {
        dispatch(setListening(false));
        SpeechRecognition.stopListening();
    }, [dispatch]);

    const handleFieldFocus = useCallback(
        (field: 'title' | 'body') => {
            dispatch(setActiveField(field));
            resetTranscript();
        },
        [resetTranscript, dispatch]
    );

    // Handle speech recognition transcript updates
    useEffect(() => {
        if (!isListening || !transcript || !activeField) return;

        const fieldRef = activeField === 'title' ? noteTitleRef : noteBodyRef;
        if (!fieldRef.current) return;

        const selection = window.getSelection();
        const hadSelection =
            selection?.rangeCount &&
            selection.getRangeAt(0).collapsed === false;

        fieldRef.current.textContent = transcript;
        dispatch(updateInputLength({ [activeField]: transcript.length }));

        if (hadSelection) {
            const range = document.createRange();
            range.selectNodeContents(fieldRef.current);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    }, [transcript, isListening, activeField, dispatch]);

    if (!browserSupportsSpeechRecognition) {
        return <p>Browser does not support speech recognition.</p>;
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
                    onClick={() => dispatch(toggleCbox())}
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
                style={{ backgroundColor: bgColor }}
            >
                <div
                    ref={noteContainerRef}
                    className='note-input__editor-content'
                    style={{ backgroundImage: bgImage }}
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
                            dispatch(setActiveField('title'));
                            resetTranscript();
                        }}
                        onInput={(e) =>
                            dispatch(
                                updateInputLength({
                                    title: e.currentTarget.innerHTML.length,
                                })
                            )
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
                                    dispatch(toggleCboxCompletedList())
                                }
                                onCheckboxChange={(id) => cboxTools(id).check()}
                                onCheckboxRemove={(id) =>
                                    cboxTools(id).remove()
                                }
                                onCheckboxUpdate={(id, value) => {
                                    dispatch(
                                        updateChecklist({
                                            id,
                                            updates: { text: value },
                                        })
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
                            {checklists.filter((cb: CheckboxI) => cb.checked)
                                .length > 0 && (
                                <>
                                    <div className='note-input__checkbox-divider'></div>
                                    <div
                                        className='note-input__checkbox-completed-header'
                                        onClick={() =>
                                            dispatch(toggleCboxCompletedList())
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
                                                        (cb: CheckboxI) =>
                                                            cb.checked
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
                                    .filter((cb: CheckboxI) => cb.checked)
                                    .map((cb: CheckboxI, index: number) => (
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
                                    dispatch(setActiveField('body'));
                                    resetTranscript();
                                }}
                                onInput={(e) =>
                                    dispatch(
                                        updateInputLength({
                                            body: e.currentTarget.innerHTML
                                                .length,
                                        })
                                    )
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
                            .filter((label: LabelI) => label.added)
                            .map((label: LabelI) => (
                                <div
                                    key={label.name}
                                    className='note-input__labels-item'
                                >
                                    <div className='note-input__labels-badge'>
                                        <span>{label.name}</span>
                                        <div
                                            className='note-input__labels-remove'
                                            onClick={() =>
                                                handleToggleLabel(label.name)
                                            }
                                        >
                                            X
                                        </div>
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
                    onSaveClick={saveNote}
                    isEditing={isEditing}
                />
            </div>

            {labelMenuOpen && (
                <div
                    className='note-input__label-menu'
                    data-tooltip='true'
                    data-is-tooltip-open='true'
                >
                    <div className='note-input__label-menu-title'>
                        <p>Label note</p>
                        <button
                            onClick={() => {
                                dispatch(toggleLabelMenu());
                            }}
                        >
                            X
                        </button>
                    </div>
                    <div className='note-input__label-menu-search'>
                        <input
                            ref={labelSearchRef}
                            type='text'
                            maxLength={50}
                            placeholder='Enter label name'
                            value={searchQuery}
                            onChange={(e) =>
                                dispatch(setSearchQuery(e.target.value))
                            }
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
                                (label: LabelI) =>
                                    label.name
                                        .toLowerCase()
                                        .includes(searchQuery.toLowerCase()) ||
                                    searchQuery === ''
                            )
                            .map((label: LabelI) => (
                                <div
                                    key={label.name}
                                    className='note-input__label-menu-item'
                                    onClick={() =>
                                        handleToggleLabel(label.name)
                                    }
                                >
                                    <div
                                        className='note-input__label-menu-item'
                                        onClick={() =>
                                            handleToggleLabel(label.name)
                                        }
                                    >
                                        <input
                                            type='checkbox'
                                            checked={label.added}
                                            onChange={() =>
                                                handleToggleLabel(label.name)
                                            }
                                            className='note-input__label-menu-checkbox'
                                        />
                                    </div>

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
