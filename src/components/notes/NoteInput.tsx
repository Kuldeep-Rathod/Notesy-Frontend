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
    useScheduleReminderMutation,
    useShareNoteMutation,
    useUpdateNoteMutation,
} from '@/redux/api/notesAPI';
import { useGetCurrentUserQuery } from '@/redux/api/userAPI';
import {
    addChecklist,
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
    toggleLabel,
    togglePinned,
    toggleTrash,
    updateInputLength,
} from '@/redux/reducer/noteInputReducer';
import '@/styles/components/notes/_noteInput.scss';
import { NoteInputProps } from '@/types/types';
import { useNoteCommands } from '@/voice-assistant/commands/noteCommands';
import usePageVoiceCommands from '@/voice-assistant/hooks/usePageVoiceCommands';
import VoiceTranscriptOverlay from '@/voice-assistant/hooks/VoiceTranscriptOverlay';
import { BookImage, Brush, SquareCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BsPin, BsPinFill } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition';
import { toast } from 'sonner';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../ui/tooltip';
import { CheckboxList } from './input/CheckboxList';
import { ImagePreview, ImagePreviewModal } from './input/ImagePreview';
import NoteToolbar from './input/NoteToolbar';
import SpeechControls from './input/SpeechControls';

export default function NoteInput({
    isEditing = false,
    noteToEdit,
    onSuccess,
}: NoteInputProps) {
    const dispatch = useDispatch();

    const { data: userData } = useGetCurrentUserQuery();
    const isPremiumUser = userData?.isPremium;

    // State for image preview modal and images
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Redux state
    const {
        checklists,
        labels,
        isArchived,
        isTrashed,
        isPinned,
        reminder,
        isCbox,
        isListening,
        activeField,
        inputLength,

        searchQuery,
        noteAppearance: { bgColor, bgImage },
        collaborators: { selectedUsers },
    } = useSelector(selectNoteInput);

    const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
    const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
    const [shareNote] = useShareNoteMutation();
    const [scheduleReminder] = useScheduleReminderMutation();

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

    // Image handling functions
    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    // Handle image changes
    const handleImageChange = (files: File[]) => {
        if (files.length > 0) {
            setImages(files);
            const previews: string[] = [];

            files.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        previews.push(reader.result);
                        setImagePreviews([...previews]);
                    }
                };
                reader.readAsDataURL(file);
            });
            toast.success(
                `${files.length} image${files.length > 1 ? 's' : ''} added`
            );
        }
    };

    // Handle image removal
    const handleImageRemove = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
        toast.success('Image removed');
    };

    const closeImageModal = () => {
        setSelectedImage(null);
    };

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

            if (!el?.contains(event.target as Node)) {
                // closeNote();
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
        if (imagePreviews) setImagePreviews([]);
    }, [mouseDownEvent, toggleNoteVisibility, dispatch]);

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
                formData.append('images', img);
            });
        }

        if (
            noteObj.noteTitle?.length ||
            noteObj.noteBody?.length ||
            checklists.length ||
            images.length
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
                    toast.success('Note updated successfully');
                } else {
                    const newNote = await createNote(formData).unwrap();
                    savedNoteId = newNote._id;
                    console.log('Note created successfully');
                    toast.success('Note created successfully');
                }

                // Share note if collaborators are selected
                if (savedNoteId && selectedUsers.length > 0) {
                    await shareNote({
                        noteId: savedNoteId,
                        emails: selectedUsers.map((user) => user.email),
                    }).unwrap();
                    console.log('Note shared successfully');
                    toast.success(
                        `Note shared with ${selectedUsers.length} user${
                            selectedUsers.length > 1 ? 's' : ''
                        }`
                    );
                }

                if (savedNoteId && reminder) {
                    await scheduleReminder().unwrap();
                    console.log('Reminder Scheduled');
                    toast.success('Reminder scheduled');
                }

                onSuccess?.();
                dispatch(resetNoteInput());

                // Clear the contentEditable divs explicitly
                if (noteTitleRef.current) noteTitleRef.current.innerHTML = '';
                if (noteBodyRef.current) noteBodyRef.current.innerHTML = '';
                if (imagePreviews) setImagePreviews([]);

                if (!isEditing) {
                    closeNote();
                }
            } catch (error) {
                console.error('Error saving note:', error);
                toast.error('Failed to save note');
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
            toast.success(
                label.added
                    ? `Label "${labelName}" removed`
                    : `Label "${labelName}" added`
            );
        } catch (error) {
            console.error('Error toggling label:', error);
            toast.error('Failed to update label');
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
                toast.success(`Label "${searchQuery.trim()}" created`);
            } catch (error) {
                console.error('Error adding new label:', error);
                toast.error('Failed to create label');
            }
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

        // resetTranscript();

        SpeechRecognition.startListening({
            continuous: true,
            language: 'en-US',
        });
    }, [dispatch, browserSupportsSpeechRecognition, resetTranscript]);

    const stopListening = useCallback(() => {
        dispatch(setListening(false));
        // SpeechRecognition.stopListening();
    }, [dispatch]);

    const handleFieldFocus = useCallback(
        (field: 'title' | 'body', clearContent = false) => {
            dispatch(setActiveField(field));
            resetTranscript();

            // Optionally clear the field content
            if (clearContent) {
                const fieldRef = field === 'title' ? noteTitleRef : noteBodyRef;
                if (fieldRef.current) {
                    fieldRef.current.textContent = '';
                    dispatch(
                        updateInputLength({
                            [field]: 0,
                        })
                    );
                }
            }
        },
        [resetTranscript, dispatch]
    );

    // Handle speech recognition transcript updates
    useEffect(() => {
        if (!isListening || !activeField) return;

        const fieldRef = activeField === 'title' ? noteTitleRef : noteBodyRef;
        if (!fieldRef.current) return;

        // Instead of replacing content, append the new transcript
        if (speechTranscript && speechTranscript.trim() !== '') {
            // Get current content
            const currentContent = fieldRef.current.textContent || '';
            // Only append the new part of the transcript
            const newContent = currentContent + ' ' + speechTranscript;

            // Update the field with appended content
            fieldRef.current.textContent = newContent;

            // Update input length
            dispatch(
                updateInputLength({
                    [activeField]: newContent.length,
                })
            );

            // Place cursor at end
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(fieldRef.current);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);

            // Reset transcript after appending
            resetTranscript();
        }
    }, [speechTranscript, isListening, activeField, dispatch, resetTranscript]);

    // Cleanup speech recognition on unmount
    useEffect(() => {
        return () => {
            if (isListening) {
                // SpeechRecognition.stopListening();
            }
        };
    }, [isListening]);

    const pathname = usePathname();
    const path = pathname.slice(1);

    const isLabelRoute = labels.some((label) => label.name === path);

    const commonNoteCommands = useNoteCommands({
        refs: {
            noteTitleRef,
            noteBodyRef,
            labelSearchRef,
        },
        labels: labels.map((label) => ({
            name: label.name,
            added: label.added || false,
        })),
        handlers: {
            onAddLabel: addNewLabel,
            handleToggleLabel,
            saveNote,
            closeNote,
        },
    });

    const { isActive: isNoteVoiceActive } = usePageVoiceCommands(
        {
            '/dashboard': commonNoteCommands,
            '/archive': commonNoteCommands,
            '/reminders': commonNoteCommands,
            ...(isLabelRoute ? { [pathname]: commonNoteCommands } : {}),
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
                />{' '}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                className={`note-input__action-icon note-input__action-icon--check H pop`}
                                onClick={() => dispatch(toggleCbox())}
                                aria-label='New list'
                            >
                                <SquareCheck />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent
                            side='top'
                            align='center'
                            className='note-input--tooltip'
                        >
                            New list
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                className={`note-input__action-icon note-input__action-icon--paint H disabled pop`}
                                aria-label='New note with drawing'
                            >
                                <Link href='/boards'>
                                    <Brush />
                                </Link>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent
                            side='top'
                            align='center'
                            className='note-input--tooltip'
                        >
                            New note with drawing
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                className={`note-input__action-icon note-input__action-icon--picture H disabled pop`}
                                aria-label='New note with image'
                            >
                                <BookImage />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent
                            side='top'
                            align='center'
                            className='note-input--tooltip'
                        >
                            New note with image
                        </TooltipContent>
                    </Tooltip>{' '}
                </TooltipProvider>
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

                    {/* Image Preview Section */}
                    <ImagePreview
                        images={imagePreviews}
                        onImageClick={handleImageClick}
                        onImageRemove={handleImageRemove}
                    />

                    {/* Note or checklists */}
                    {isCbox ? (
                        <>
                            {/* checklists */}
                            <CheckboxList />

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

                    <SpeechControls
                        isListening={isListening}
                        isPremiumUser={isPremiumUser}
                        activeField={activeField}
                        startListening={startListening}
                        stopListening={stopListening}
                        resetTranscript={resetTranscript}
                        handleFieldFocus={handleFieldFocus}
                    />

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
                {/* Pin icon */}{' '}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                ref={notePinRef}
                                data-pinned={isPinned.toString()}
                                className={`note-input__pin`}
                                onClick={handlePinClick}
                            >
                                {isPinned ? <BsPinFill /> : <BsPin />}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent
                            side='top'
                            align='center'
                        >
                            Pin Note
                        </TooltipContent>
                    </Tooltip>{' '}
                </TooltipProvider>
                {/* Icons */}
                <NoteToolbar
                    onDiscardClick={closeNote}
                    onSaveClick={saveNote}
                    isEditing={isEditing}
                    onImageChange={handleImageChange}
                />
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <ImagePreviewModal
                    imageUrl={selectedImage}
                    onClose={closeImageModal}
                />
            )}

            {/* Voice Control Status Indicator */}
            {isNoteVoiceActive && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            bottom: 80,
                            right: 20,
                            backgroundColor: isListening
                                ? '#4CAF50'
                                : '#2196F3',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            zIndex: 100,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        🎙️ Note Voice Commands Active
                    </div>
                    <VoiceTranscriptOverlay pageCommands={commonNoteCommands} />
                </>
            )}
        </div>
    );
}
