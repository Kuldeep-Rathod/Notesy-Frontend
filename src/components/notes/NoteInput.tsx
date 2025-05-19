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
import usePageVoiceCommands from '@/voice-assistant/hooks/usePageVoiceCommands';
import { useNoteCommands } from '@/voice-assistant/commands/noteCommands';

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
        images,
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
    const noteTitleRef = useRef<HTMLDivElement>(
        null
    ) as React.RefObject<HTMLDivElement>;
    const noteBodyRef = useRef<HTMLDivElement>(
        null
    ) as React.RefObject<HTMLDivElement>;
    const notePinRef = useRef<HTMLDivElement>(
        null
    ) as React.RefObject<HTMLDivElement>;
    const cboxInputRef = useRef<HTMLDivElement>(
        null
    ) as React.RefObject<HTMLDivElement>;
    const cboxPhRef = useRef<HTMLDivElement>(
        null
    ) as React.RefObject<HTMLDivElement>;
    const labelSearchRef = useRef<HTMLInputElement>(
        null
    ) as React.RefObject<HTMLInputElement>;

    // Get labels
    const { data: serverLabels = [], refetch: refetchLabels } =
        useGetLabelsQuery();
    const [addLabel] = useAddLabelMutation();
    const [attachLabelsToNote] = useAttachLabelsToNoteMutation();

    // Keep previous labels reference for comparison
    const prevLabelsRef = useRef<string[]>([]);
    const prevNoteToEditRef = useRef<NoteI | null>(null);

    // For tracking if we've already initialized for the current note
    const noteInitializedRef = useRef<string | null>(null);

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

        // Add a small delay to ensure DOM elements are properly rendered
        setTimeout(() => {
            if (isCbox) {
                if (cboxPhRef.current) {
                    cboxPhRef.current.focus();
                }
            } else {
                if (noteBodyRef.current) {
                    noteBodyRef.current.focus();
                }
            }
        }, 0);

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

    // Toggle checkbox mode
    const handleToggleCbox = useCallback(() => {
        dispatch(toggleCbox());
    }, [dispatch]);

    // Save note
    const saveNote = useCallback(async () => {
        if (
            !noteTitleRef.current ||
            !noteBodyRef.current ||
            !noteContainerRef.current ||
            !noteMainRef.current ||
            !notePinRef.current
        )
            return;

        const formData = new FormData();

        const noteObj = {
            noteTitle: noteTitleRef.current.innerHTML,
            noteBody: noteBodyRef.current.innerHTML,
            pinned: notePinRef.current.dataset.pinned === 'true',
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
            images: images,
        };

        formData.set('noteTitle', noteTitleRef.current.innerHTML);
        formData.set('noteBody', noteBodyRef.current.innerHTML);
        formData.set(
            'pinned',
            notePinRef.current.dataset.pinned === 'true' ? 'true' : 'false'
        );

        const bgColor = noteMainRef.current.style.backgroundColor || '';
        const bgImage = noteContainerRef.current.style.backgroundImage || '';

        formData.set('bgColor', bgColor);
        formData.set('bgImage', bgImage);
        formData.set('isCbox', isCbox ? 'true' : 'false');
        formData.set('archived', isArchived ? 'true' : 'false');
        formData.set('trashed', isTrashed ? 'true' : 'false');

        if (reminder) {
            formData.set('reminder', reminder);
        }

        if (checklists.length > 0) {
            formData.set('checklists', JSON.stringify(checklists));
        }

        // Add labels
        const addedLabels = labels.filter((label: LabelI) => label.added);
        if (addedLabels.length > 0) {
            addedLabels.forEach((label: LabelI) => {
                formData.append('labels[]', label.name);
            });
        }

        // Add images
        if (images.length > 0) {
            images.forEach((img) => {
                if (typeof img !== 'string') {
                    formData.append('images', img); // File
                }
            });
        }

        console.log('FormData:', formData);

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
                        updates: formData,
                    }).unwrap();
                    savedNoteId = updatedNote._id;
                    console.log('Note updated successfully');
                } else {
                    const newNote = await createNote(formData).unwrap();
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
        images,
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
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                const currentText = event.currentTarget.innerHTML;
                if (currentText.trim()) {
                    dispatch(
                        addChecklist({
                            id: Date.now(),
                            text: currentText,
                            checked: false,
                        })
                    );
                    event.currentTarget.innerHTML = '';
                }
            }
        },
        [dispatch]
    );

    // Handle checkbox changes
    const handleCheckboxChange = (id: number | string) => {
        dispatch(
            updateChecklist({
                id,
                updates: {
                    checked: !checklists.find(
                        (cb) => cb.id === id || cb._id === id
                    )?.checked,
                },
            })
        );
    };

    // Handle checkbox removal
    const handleCheckboxRemove = (id: number | string) => {
        dispatch(removeChecklist(id));
    };

    // Handle checkbox text update
    const handleCheckboxUpdate = (id: number | string, value: string) => {
        if (value.trim()) {
            dispatch(updateChecklist({ id, updates: { text: value } }));
        }
    };

    // Handle keyboard events for checkboxes
    const handleCheckboxKeyDown = (
        e: React.KeyboardEvent,
        id: number | string
    ) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const currentText = e.currentTarget.innerHTML;
            if (currentText.trim()) {
                const newId = Date.now();
                dispatch(addChecklist({ id: newId, text: '', checked: false }));
                setTimeout(() => {
                    const newCheckbox = document.querySelector(
                        `[data-checkbox-id="${newId}"]`
                    );
                    if (newCheckbox instanceof HTMLElement) {
                        newCheckbox.focus();
                    }
                }, 0);
            }
        } else if (e.key === 'Backspace' && e.currentTarget.innerHTML === '') {
            e.preventDefault();
            handleCheckboxRemove(id);
            if (typeof id === 'number') {
                const prevCheckbox = document.querySelector(
                    `[data-checkbox-id="${id - 1}"]`
                );
                if (prevCheckbox instanceof HTMLElement) {
                    prevCheckbox.focus();
                }
            }
        }
    };

    // Toggle completed checkboxes list
    const handleToggleCompletedList = () => {
        dispatch(toggleCboxCompletedList());
    };

    // Update labels state when server labels change
    useEffect(() => {
        if (serverLabels) {
            // Check if serverLabels or noteToEdit has actually changed
            const currentLabelsStr = JSON.stringify(serverLabels);
            const currentNoteToEditStr =
                isEditing && noteToEdit
                    ? JSON.stringify({
                          id: noteToEdit._id,
                          labels: noteToEdit.labels,
                      })
                    : '';

            const prevLabelsStr = JSON.stringify(prevLabelsRef.current);
            const prevNoteToEditStr = prevNoteToEditRef.current
                ? JSON.stringify({
                      id: prevNoteToEditRef.current._id,
                      labels: prevNoteToEditRef.current.labels,
                  })
                : '';

            // Update only if something actually changed
            if (
                currentLabelsStr !== prevLabelsStr ||
                (isEditing && currentNoteToEditStr !== prevNoteToEditStr)
            ) {
                const formattedLabels: LabelI[] = serverLabels.map(
                    (labelName) => ({
                        name: labelName,
                        added:
                            (isEditing &&
                                noteToEdit?.labels?.some((noteLabel) =>
                                    typeof noteLabel === 'string'
                                        ? noteLabel === labelName
                                        : noteLabel.name === labelName
                                )) ||
                            false,
                    })
                );

                dispatch(setLabels(formattedLabels));
                dispatch(setAvailableLabels(formattedLabels));

                // Update refs with current values
                prevLabelsRef.current = [...serverLabels];
                if (isEditing && noteToEdit) {
                    prevNoteToEditRef.current = noteToEdit;
                }
            }
        }
    }, [serverLabels, isEditing, noteToEdit, dispatch]);

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
            // Only initialize if this is a different note than before
            const noteId = noteToEdit._id?.toString();
            if (noteId && noteInitializedRef.current === noteId) {
                return; // Already initialized this note
            }

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

            // Set checklists first
            if (noteToEdit.checklists && noteToEdit.checklists.length > 0) {
                // Normalize checkboxes to handle both id and _id formats
                const normalizedChecklists = noteToEdit.checklists.map((cb) => {
                    if (cb.id === undefined && cb._id !== undefined) {
                        return { ...cb, id: cb._id };
                    }
                    return cb;
                }) as CheckboxI[];

                dispatch(setChecklists(normalizedChecklists));
                dispatch(toggleCbox());
            }

            // Set archived and trashed state
            if (noteToEdit.archived) {
                dispatch(toggleArchive());
            }
            if (noteToEdit.trashed) {
                dispatch(toggleTrash());
            }

            // Update input length
            dispatch(
                updateInputLength({
                    title: noteToEdit.noteTitle?.length || 0,
                    body: noteToEdit.noteBody?.length || 0,
                    cb: noteToEdit.checklists?.length || 0,
                })
            );

            // Mark as initialized for this note
            if (noteId) {
                noteInitializedRef.current = noteId;
            }
        }
    }, [isEditing, noteToEdit, notePhClick, dispatch]);

    const {
        transcript: speechTranscript,
        resetTranscript,
        browserSupportsSpeechRecognition,
        listening,
    } = useSpeechRecognition();

    const startListening = useCallback(() => {
        if (!browserSupportsSpeechRecognition) {
            console.error(
                'Speech recognition is not supported in this browser'
            );
            return;
        }
        dispatch(setListening(true));
        SpeechRecognition.startListening({
            continuous: true,
            language: 'en-US',
        });
    }, [dispatch, browserSupportsSpeechRecognition]);

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
        if (!isListening || !speechTranscript || !activeField) return;

        const fieldRef = activeField === 'title' ? noteTitleRef : noteBodyRef;
        if (!fieldRef.current) return;

        // Get current content
        const currentContent = fieldRef.current.textContent || '';

        // Append new transcript to current content
        fieldRef.current.textContent = currentContent + ' ' + speechTranscript;

        // Update input length
        dispatch(
            updateInputLength({
                [activeField]: fieldRef.current.textContent.length,
            })
        );

        // Place cursor at end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(fieldRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
    }, [speechTranscript, isListening, activeField, dispatch]);

    // Cleanup speech recognition on unmount
    useEffect(() => {
        return () => {
            if (isListening) {
                SpeechRecognition.stopListening();
            }
        };
    }, [isListening]);

    // Initialize voice commands for note input
    const { isActive: isNoteVoiceActive } = usePageVoiceCommands(
        {
            '/dashboard': useNoteCommands({
                refs: {
                    noteTitleRef,
                    noteBodyRef,
                    labelSearchRef,
                },
                labels: labels.map((label) => ({
                    name: label.name,
                    added: label.added || false,
                })),
            }),
        },
        { debug: true, requireWakeWord: true }
    );

    if (!browserSupportsSpeechRecognition) {
        return (
            <p>
                Your browser does not support speech recognition. Please try
                using Chrome or Edge.
            </p>
        );
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
                    className={`note-input__action-icon note-input__action-icon--check H pop note-input--tooltip`}
                    data-tooltip='New list'
                    onClick={() => dispatch(toggleCbox())}
                >
                    <SquareCheck />
                </div>
                <div
                    className={`note-input__action-icon note-input__action-icon--paint H disabled pop note-input--tooltip`}
                    data-tooltip='New note with drawing'
                >
                    <Brush />
                </div>
                <div
                    className={`note-input__action-icon note-input__action-icon--picture H disabled pop note-input--tooltip`}
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
                            if (noteTitleRef.current) {
                                dispatch(setActiveField('title'));
                                resetTranscript();
                            }
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
                                    body: e.currentTarget.innerHTML.length,
                                })
                            )
                        }
                        onPaste={pasteEvent}
                        className='note-input__body'
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
                                onToggleCollapse={handleToggleCompletedList}
                                onCheckboxChange={handleCheckboxChange}
                                onCheckboxRemove={handleCheckboxRemove}
                                onCheckboxUpdate={handleCheckboxUpdate}
                                onKeyDown={handleCheckboxKeyDown}
                            />

                            {/* Checkbox placeholder */}
                            <div className='note-input__checkbox-placeholder'>
                                <div className='note-input__checkbox-placeholder-icon'>
                                    <div className='note-input__checkbox-icon'></div>
                                </div>
                                <div className='note-input__checkbox-content'>
                                    <div
                                        ref={cboxPhRef}
                                        onKeyDown={cboxPhKeyDown}
                                        className='note-input__checkbox-item'
                                        contentEditable
                                        spellCheck
                                        data-placeholder='List item'
                                    ></div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <></>
                    )}

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
                        <button onClick={resetTranscript}>🔁 Clear</button>
                        {isListening && <span>Listening...</span>}
                    </div>

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
                    className={`note-input__pin H pop note-input--tooltip`}
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
                    className='absolute z-10 w-80 bg-white shadow-lg rounded-md p-4'
                    data-tooltip='true'
                    data-is-tooltip-open='true'
                >
                    <div className='flex justify-between items-center border-b pb-2 mb-3'>
                        <p className='text-lg font-medium'>Label note</p>
                        <button
                            className='text-red-500 hover:text-red-700 text-xl'
                            onClick={() => {
                                dispatch(toggleLabelMenu());
                            }}
                        >
                            ×
                        </button>
                    </div>

                    <div className='flex items-center border rounded-md overflow-hidden mb-4'>
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
                            className='w-full px-3 py-2 outline-none'
                        />
                        <div
                            className='px-3 py-2 cursor-pointer bg-blue-500 text-white hover:bg-blue-600'
                            onClick={addNewLabel}
                        >
                            +
                        </div>
                    </div>

                    <div className='max-h-60 overflow-y-auto space-y-2'>
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
                                    className='flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-100'
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
                                        className='mr-2 cursor-pointer'
                                    />
                                    <span className='flex-1'>{label.name}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Voice Control Status Indicator */}
            {isNoteVoiceActive && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 80,
                        right: 20,
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        zIndex: 100,
                    }}
                >
                    🎙️ Note Voice Commands Active
                </div>
            )}
        </div>
    );
}
