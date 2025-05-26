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
                }
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.7,
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
            },
            isFuzzyMatch: true,
        },

        {
            command: ['save note', 'save changes', 'store note', 'keep note'],
            callback: () => {
                closeAllMenus();
                handlers.saveNote();
            },
            isFuzzyMatch: true,
        },

        {
            command: ['close note', 'discard changes'],
            callback: () => {
                closeAllMenus();
                handlers.closeNote();
            },
            isFuzzyMatch: true,
        },

        //Commands for set reminders
        {
            command: ['set reminder', 'add reminder', 'schedule reminder'],
            callback: () => {
                closeAllMenus();
                dispatch(toggleReminderMenu());
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
                    return;
                }
                const reminder = quickOptions.find(
                    (opt) => opt.label === 'Later today'
                );
                if (reminder) {
                    const selectedDate = reminder.time();
                    dispatch(setReminder(selectedDate.toISOString()));
                    dispatch(closeReminderMenu());
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
                    return;
                }

                const reminder = quickOptions.find(
                    (opt) => opt.label === 'Tomorrow'
                );
                if (reminder) {
                    const selectedDate = reminder.time();
                    dispatch(setReminder(selectedDate.toISOString()));
                    dispatch(closeReminderMenu());
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
                    return;
                }

                const reminder = quickOptions.find(
                    (opt) => opt.label === 'Next week'
                );
                if (reminder) {
                    const selectedDate = reminder.time();
                    dispatch(setReminder(selectedDate.toISOString()));
                    dispatch(closeReminderMenu());
                }
            },
            isFuzzyMatch: true,
        },
        {
            command: ['remove reminder', 'clear reminder', 'delete reminder'],
            callback: () => {
                if (!reminderMenuOpen) {
                    dispatch(toggleReminderMenu());
                    return;
                }

                dispatch(setReminder(null));
                dispatch(closeReminderMenu());
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
            },
            isFuzzyMatch: true,
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
            },
            isFuzzyMatch: true,
        },
        {
            command: ['take search *', 'label find *', 'look for label *'],
            callback: (labelName: string) => {
                if (!labelMenuOpen) {
                    closeAllMenus();
                    dispatch(toggleLabelMenu());
                }
                if (refs.labelSearchRef.current) {
                    refs.labelSearchRef.current.value = labelName;
                    dispatch(setSearchQuery(labelName));
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
                }
            },
        },

        // Checkbox Commands
        {
            command: ['show checkboxes', 'show checklist', 'show tasks'],
            callback: () => {
                closeAllMenus();
                dispatch(toggleCbox());
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
                    dispatch(
                        updateChecklist({
                            id: task.id ?? '',
                            updates: {
                                checked: !checklists.find(
                                    (cb) =>
                                        cb.id === task.id || cb._id === task.id
                                )?.checked,
                            },
                        })
                    );
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
                } else {
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
            },
            isFuzzyMatch: true,
        },
    ];
};
