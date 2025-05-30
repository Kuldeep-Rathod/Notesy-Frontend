import { quickOptions } from '@/components/notes/input/ReminderPicker';
import { LabelI } from '@/interfaces/labels';
import { bgColors } from '@/interfaces/tooltip';
import { useGetAllUsersQuery } from '@/redux/api/userAPI';
import {
    addChecklist,
    addCollaborator,
    closeReminderMenu,
    removeCollaborator,
    selectNoteInput,
    setBgColor,
    setCollaboratorSearchTerm,
    setReminder,
    setSearchQuery,
    toggleArchive,
    toggleCbox,
    toggleCollaboratorMenu,
    toggleColorMenu,
    toggleLabelMenu,
    togglePinned,
    toggleReminderMenu,
    updateChecklist,
} from '@/redux/reducer/noteInputReducer';
import { useDispatch, useSelector } from 'react-redux';
import { speak } from '../VoiceRouter';

interface NoteCommandsParams {
    refs: {
        noteTitleRef: React.RefObject<HTMLDivElement>;
        noteBodyRef: React.RefObject<HTMLDivElement>;
        labelSearchRef: React.RefObject<HTMLInputElement>;
    };
    labels: LabelI[];
    handlers: {
        onAddLabel: () => void;
        handleToggleLabel: (labelName: string) => void;
        saveNote: () => void;
        closeNote: () => void;
    };
}

export const useNoteCommands = ({
    refs,
    labels,
    handlers,
}: NoteCommandsParams) => {
    const dispatch = useDispatch();

    const {
        isCbox,
        checklists,
        tooltips: {
            moreMenuOpen,
            colorMenuOpen,
            collaboratorMenuOpen,
            reminderMenuOpen,
            labelMenuOpen,
        },
        collaborators: { selectedUsers: selectedCollaborators },
    } = useSelector(selectNoteInput);

    const { data: users = [] } = useGetAllUsersQuery();

    const collabCommandPrefixes = {
        userSearch: [
            'user find *',
            'user search *',
            'user search for *',
            'look up user *',
        ],
        selectUser: [
            'add user *',
            'share with *',
            'invite *',
            'collaborator *',
        ],
        removeUser: [
            'remove user *',
            'unshare with *',
            'delete collaborator *',
        ],
    };

    const extractCleanUserName = (fullPhrase: string, prefixes: string[]) => {
        for (const prefix of prefixes) {
            if (fullPhrase.toLowerCase().startsWith(prefix)) {
                return fullPhrase.substring(prefix.length).trim();
            }
        }
        return fullPhrase.trim();
    };

    const findUser = (cleanUserName: string) => {
        return users.find(
            (u) =>
                u.name?.toLowerCase() === cleanUserName.toLowerCase() ||
                u.email?.toLowerCase() === cleanUserName.toLowerCase()
        );
    };

    // Helper function to ensure only one menu is open at a time
    const closeAllMenus = () => {
        if (reminderMenuOpen) dispatch(closeReminderMenu());
        if (colorMenuOpen) dispatch(toggleColorMenu());
        if (labelMenuOpen) dispatch(toggleLabelMenu());
        if (collaboratorMenuOpen) dispatch(toggleCollaboratorMenu());
    };

    return [
        // Title and Body Commands
        {
            command: [
                'focus title',
                'edit title',
                'change title',
                'go to title',
                'set title',
            ],
            callback: () => {
                closeAllMenus();
                const inputEl = refs.noteTitleRef.current;

                if (inputEl) {
                    inputEl.focus();

                    // For contentEditable elements
                    if (
                        'contentEditable' in inputEl &&
                        inputEl.isContentEditable
                    ) {
                        const range = document.createRange();
                        const sel = window.getSelection();

                        range.selectNodeContents(inputEl);
                        range.collapse(false); // Move to end
                        sel?.removeAllRanges();
                        sel?.addRange(range);
                    }

                    // For <input> or <textarea>
                    if (
                        inputEl instanceof HTMLInputElement ||
                        inputEl instanceof HTMLTextAreaElement
                    ) {
                        const len = inputEl.value.length;
                        inputEl.setSelectionRange(len, len); // Move cursor to end
                    }

                    speak('Focused on note title.');
                }
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.7,
        },
        {
            command: [
                'focus body',
                'edit content',
                'write note',
                'go to description',
                'set description',
            ],
            callback: () => {
                closeAllMenus();
                const bodyEl = refs.noteBodyRef.current;

                if (bodyEl) {
                    bodyEl.focus();

                    // For contentEditable elements, move cursor to the end
                    if (
                        'contentEditable' in bodyEl &&
                        bodyEl.isContentEditable
                    ) {
                        const range = document.createRange();
                        const sel = window.getSelection();

                        range.selectNodeContents(bodyEl);
                        range.collapse(false); // Move to end
                        sel?.removeAllRanges();
                        sel?.addRange(range);
                    }

                    // If it's an input or textarea
                    if (
                        bodyEl instanceof HTMLInputElement ||
                        bodyEl instanceof HTMLTextAreaElement
                    ) {
                        const len = bodyEl.value.length;
                        bodyEl.setSelectionRange(len, len);
                    }

                    speak('Focused on note content.');
                }
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.7,
        },
        {
            command: [
                'set title *',
                'title is *',
                'make title *',
                'write title *',
            ],
            callback: (title: string) => {
                closeAllMenus();
                const inputEl = refs.noteTitleRef.current;
                if (inputEl && title) {
                    inputEl.innerHTML = title;
                    const event = new Event('input', { bubbles: true });
                    inputEl.dispatchEvent(event);
                    speak(`Title set to: ${title}`);
                }
            },
            isFuzzyMatch: false,
        },
        {
            command: [
                'set content *',
                'set body *',
                'write content *',
                'write body *',
                'content is *',
                'body is *',
            ],
            callback: (content: string) => {
                closeAllMenus();
                const bodyEl = refs.noteBodyRef.current;
                if (bodyEl && content) {
                    bodyEl.innerHTML = content;
                    const event = new Event('input', { bubbles: true });
                    bodyEl.dispatchEvent(event);
                    speak('Note content updated.');
                }
            },
            isFuzzyMatch: false,
        },
        {
            command: [
                'append content *',
                'add content *',
                'continue writing *',
                'add to body *',
            ],
            callback: (content: string) => {
                closeAllMenus();
                const bodyEl = refs.noteBodyRef.current;
                if (bodyEl && content) {
                    bodyEl.innerHTML = bodyEl.innerHTML + ' ' + content;
                    const event = new Event('input', { bubbles: true });
                    bodyEl.dispatchEvent(event);
                    speak('Content added to note.');
                }
            },
            isFuzzyMatch: false,
        },

        {
            command: [
                'pin note',
                'pin this',
                'make important',
                'unpin note',
                'remove pin',
            ],
            callback: () => {
                closeAllMenus();
                dispatch(togglePinned());
                speak('Note pin toggled.');
            },
            isFuzzyMatch: true,
        },

        {
            command: ['save note', 'save changes', 'store note', 'keep note'],
            callback: () => {
                closeAllMenus();
                handlers.saveNote();
                speak('Note saved successfully.');
            },
            isFuzzyMatch: true,
        },

        {
            command: ['close note', 'discard changes'],
            callback: () => {
                closeAllMenus();
                handlers.closeNote();
                speak('Note closed.');
            },
            isFuzzyMatch: true,
        },

        //Commands for set reminders
        {
            command: ['set reminder', 'add reminder', 'schedule reminder'],
            callback: () => {
                closeAllMenus();
                dispatch(toggleReminderMenu());
                speak('Reminder menu opened.');
            },
            isFuzzyMatch: true,
        },
        {
            command: [
                'remind me today',
                'later today',
                'remind me later today',
                'today reminder',
            ],
            callback: () => {
                if (!reminderMenuOpen) {
                    dispatch(toggleReminderMenu());
                    speak('Setting reminder for later today.');
                    return;
                }
                const reminder = quickOptions.find(
                    (opt) => opt.label === 'Later today'
                );
                if (reminder) {
                    const selectedDate = reminder.time();
                    dispatch(setReminder(selectedDate.toISOString()));
                    dispatch(closeReminderMenu());
                    speak('Reminder set for later today.');
                }
            },
            isFuzzyMatch: true,
        },
        {
            command: [
                'remind tomorrow',
                'tomorrow reminder',
                'next day reminder',
            ],
            callback: () => {
                if (!reminderMenuOpen) {
                    dispatch(toggleReminderMenu());
                    speak('Setting reminder for tomorrow.');
                    return;
                }

                const reminder = quickOptions.find(
                    (opt) => opt.label === 'Tomorrow'
                );
                if (reminder) {
                    const selectedDate = reminder.time();
                    dispatch(setReminder(selectedDate.toISOString()));
                    dispatch(closeReminderMenu());
                    speak('Reminder set for tomorrow.');
                }
            },
            isFuzzyMatch: true,
        },
        {
            command: [
                'remind next week',
                'next week reminder',
                'week reminder',
            ],
            callback: () => {
                if (!reminderMenuOpen) {
                    dispatch(toggleReminderMenu());
                    speak('Setting reminder for next week.');
                    return;
                }

                const reminder = quickOptions.find(
                    (opt) => opt.label === 'Next week'
                );
                if (reminder) {
                    const selectedDate = reminder.time();
                    dispatch(setReminder(selectedDate.toISOString()));
                    dispatch(closeReminderMenu());
                    speak('Reminder set for next week.');
                }
            },
            isFuzzyMatch: true,
        },
        {
            command: ['remove reminder', 'clear reminder', 'delete reminder'],
            callback: () => {
                if (!reminderMenuOpen) {
                    dispatch(toggleReminderMenu());
                    speak('Removing reminder.');
                    return;
                }

                dispatch(setReminder(null));
                dispatch(closeReminderMenu());
                speak('Reminder removed.');
            },
        },

        // Collaborator Commands
        {
            command: [
                'add collaborator',
                'share note',
                'invite people',
                'manage sharing',
            ],
            callback: () => {
                closeAllMenus();
                dispatch(toggleCollaboratorMenu());
                speak('Collaborator menu opened.');
            },
            isFuzzyMatch: true,
        },
        {
            command: collabCommandPrefixes.userSearch,
            callback: (fullPhrase: string) => {
                if (!collaboratorMenuOpen) {
                    closeAllMenus();
                    dispatch(toggleCollaboratorMenu());
                }

                const cleanUserName = extractCleanUserName(
                    fullPhrase,
                    collabCommandPrefixes.userSearch
                );

                dispatch(setCollaboratorSearchTerm(cleanUserName));
                speak(`Searching for user: ${cleanUserName}`);
            },
        },
        {
            command: [
                'clear user search',
                'reset user search',
                'cancel user search',
            ],
            callback: () => {
                if (!collaboratorMenuOpen) {
                    closeAllMenus();
                    dispatch(toggleCollaboratorMenu());
                }
                dispatch(setCollaboratorSearchTerm(''));
                speak('User search cleared.');
            },
        },
        {
            command: collabCommandPrefixes.selectUser,
            callback: (fullPhrase: string) => {
                if (!collaboratorMenuOpen) {
                    closeAllMenus();
                    dispatch(toggleCollaboratorMenu());
                }

                const cleanUserName = extractCleanUserName(
                    fullPhrase,
                    collabCommandPrefixes.selectUser
                );

                const user = findUser(cleanUserName);

                if (user) {
                    dispatch(
                        addCollaborator({
                            uid: user.firebaseUid,
                            email: user.email,
                            name: user.name || user.email,
                        })
                    );
                    speak(`Added ${user.name || user.email} as collaborator.`);
                } else {
                    speak(`User ${cleanUserName} not found.`);
                }
            },
        },
        {
            command: collabCommandPrefixes.removeUser,
            callback: (fullPhrase: string) => {
                if (!collaboratorMenuOpen) {
                    closeAllMenus();
                    dispatch(toggleCollaboratorMenu());
                }
                const cleanUserName = extractCleanUserName(
                    fullPhrase,
                    collabCommandPrefixes.removeUser
                );

                const user = findUser(cleanUserName);

                if (user) {
                    dispatch(removeCollaborator(user.firebaseUid));
                    speak(
                        `Removed ${user.name || user.email} from collaborators.`
                    );
                } else {
                    speak(`User ${cleanUserName} not found.`);
                }
            },
        },

        //Set Label Commands
        {
            command: [
                'open labels',
                'manage labels',
                'manage tags',
                'show labels',
                'edit tags',
            ],
            callback: () => {
                closeAllMenus();
                dispatch(toggleLabelMenu());
                speak('Label menu opened.');
            },
            isFuzzyMatch: true,
        },
        {
            command: [
                'take search *',
                'tag search *',
                'label find *',
                'look for label *',
            ],
            callback: (labelName: string) => {
                if (!labelMenuOpen) {
                    closeAllMenus();
                    dispatch(toggleLabelMenu());
                }
                if (refs.labelSearchRef.current) {
                    refs.labelSearchRef.current.value = labelName;
                    dispatch(setSearchQuery(labelName));
                    speak(`Searching for label: ${labelName}`);
                }
            },
        },
        {
            command: [
                'clear label search',
                'reset label search',
                'clear tag search',
                'reset tag search',
            ],
            callback: () => {
                if (!labelMenuOpen) {
                    closeAllMenus();
                    dispatch(toggleLabelMenu());
                }
                dispatch(setSearchQuery(''));
                speak('Label search cleared.');
            },
            isFuzzyMatch: true,
        },
        {
            command: ['new label', 'make label', 'add new tag'],
            callback: () => {
                if (!labelMenuOpen) {
                    closeAllMenus();
                    dispatch(toggleLabelMenu());
                }
                handlers.onAddLabel();
                speak('Creating new label.');
            },
            isFuzzyMatch: true,
        },
        {
            command: [
                'label with *',
                'tag with *',
                'take with *',
                'label as *',
            ],
            callback: (fullPhrase: string) => {
                if (!labelMenuOpen) {
                    closeAllMenus();
                    dispatch(toggleLabelMenu());
                }
                const cleanLabelName = extractCleanUserName(fullPhrase, [
                    'take with',
                    'label with',
                    'tag with',
                    'label as',
                ]);

                if (cleanLabelName) {
                    handlers.handleToggleLabel(cleanLabelName);
                    speak(`Label "${cleanLabelName}" toggled.`);
                }
            },
        },

        // Checkbox Commands
        {
            command: ['show checkboxes', 'show checklist', 'show tasks'],
            callback: () => {
                closeAllMenus();
                dispatch(toggleCbox());
                speak('Checklist view toggled.');
            },
            isFuzzyMatch: true,
        },
        {
            command: ['add item *', 'new task *', 'create checklist *'],
            callback: (fullPhrase: string) => {
                closeAllMenus();
                const cleanText = extractCleanUserName(fullPhrase, [
                    'add item',
                    'new task',
                    'create checklist',
                ]);
                if (!isCbox) {
                    dispatch(toggleCbox());
                }
                dispatch(
                    addChecklist({
                        id: Date.now(),
                        text: cleanText,
                        checked: false,
                    })
                );
                speak(`Added checklist item: ${cleanText}`);
            },
        },
        {
            command: [
                'complete *',
                'check *',
                'mark * as done',
                'uncheck *',
                'toggle *',
            ],
            callback: (fullPhrase: string) => {
                closeAllMenus();
                const cleanTaskText = extractCleanUserName(fullPhrase, [
                    'complete',
                    'check',
                    'mark',
                    'uncheck',
                    'toggle',
                ]);

                const task = checklists.find((t) =>
                    t.text.toLowerCase().includes(cleanTaskText.toLowerCase())
                );

                if (task) {
                    const isCurrentlyChecked = checklists.find(
                        (cb) => cb.id === task.id || cb._id === task.id
                    )?.checked;

                    dispatch(
                        updateChecklist({
                            id: task.id ?? '',
                            updates: {
                                checked: !isCurrentlyChecked,
                            },
                        })
                    );

                    const action = !isCurrentlyChecked
                        ? 'completed'
                        : 'unchecked';
                    speak(`Task "${task.text}" ${action}.`);
                } else {
                    speak(`Task "${cleanTaskText}" not found.`);
                }
            },
        },

        // Background colour
        {
            command: [
                'change colour',
                'show colours',
                'colour options',
                'close colour options',
            ],
            callback: () => {
                closeAllMenus();
                dispatch(toggleColorMenu());
                speak('Color menu toggled.');
            },
            isFuzzyMatch: true,
        },
        {
            command: ['set colour *', 'make *', 'colour *', 'background *'],
            callback: (fullPhrase: string) => {
                if (!colorMenuOpen) {
                    closeAllMenus();
                    dispatch(toggleColorMenu());
                }
                const spokenColor = fullPhrase.split(' ').pop()?.toLowerCase();

                // Check if the spoken color exists in bgColors
                if (spokenColor && spokenColor in bgColors) {
                    const hexColor =
                        bgColors[spokenColor as keyof typeof bgColors];
                    dispatch(setBgColor(hexColor));
                    dispatch(toggleColorMenu());
                    speak(`Background color changed to ${spokenColor}.`);
                } else {
                    speak(`Color "${spokenColor}" not available.`);
                    console.warn(`Unknown color: ${spokenColor}`);
                }
            },
        },
        {
            command: [
                'archive current note',
                'archive note',
                'archive this note',
                'archive this not',
            ],
            callback: () => {
                closeAllMenus();
                dispatch(toggleArchive());
                speak('Note archived.');
            },
            isFuzzyMatch: true,
        },
    ];
};
