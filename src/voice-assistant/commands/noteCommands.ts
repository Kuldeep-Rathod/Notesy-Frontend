import { quickOptions } from '@/components/notes/input/ReminderPicker';
import { LabelI } from '@/interfaces/labels';
import { useGetAllUsersQuery } from '@/redux/api/userAPI';
import {
    addChecklist,
    addCollaborator,
    closeReminderMenu,
    removeCollaborator,
    selectNoteInput,
    setCollaboratorSearchTerm,
    setReminder,
    setSearchQuery,
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
        },
        collaborators: { selectedUsers: selectedCollaborators },
    } = useSelector(selectNoteInput);

    const { data: users = [] } = useGetAllUsersQuery();

    const collabCommandPrefixes = {
        userSearch: ['user search', 'user find', 'look for user'],
        selectUser: ['select user', 'add user', 'share with'],
        removeUser: ['remove user', 'unshare with', 'remove collaborator'],
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

    return [
        // Title and Body Commands
        {
            command: ['set title', 'title is', 'note title'],
            callback: () => {
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
            command: ['set description', 'note content', 'write'],
            callback: () => {
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
            command: ['pin not', 'pin note', 'pin'],
            callback: () => {
                dispatch(togglePinned());
            },
        },

        {
            command: ['save note', 'save', 'save not'],
            callback: () => {
                handlers.saveNote();
            },
        },

        //Commands for set reminders
        {
            command: ['set reminder', 'schedule reminder'],
            callback: () => {
                dispatch(toggleReminderMenu());
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.6,
        },
        {
            command: 'remind me later today',
            callback: () => {
                if (!reminderMenuOpen) return;

                const reminder = quickOptions.find(
                    (opt) => opt.label === 'Later today'
                );
                if (reminder) {
                    const selectedDate = reminder.time();
                    dispatch(setReminder(selectedDate.toISOString()));
                    dispatch(closeReminderMenu());
                }
            },
        },
        {
            command: 'remind me tomorrow',
            callback: () => {
                if (!reminderMenuOpen) return;

                const reminder = quickOptions.find(
                    (opt) => opt.label === 'Tomorrow'
                );
                if (reminder) {
                    const selectedDate = reminder.time();
                    dispatch(setReminder(selectedDate.toISOString()));
                    dispatch(closeReminderMenu());
                }
            },
        },
        {
            command: 'remind me next week',
            callback: () => {
                if (!reminderMenuOpen) return;

                const reminder = quickOptions.find(
                    (opt) => opt.label === 'Next week'
                );
                if (reminder) {
                    const selectedDate = reminder.time();
                    dispatch(setReminder(selectedDate.toISOString()));
                    dispatch(closeReminderMenu());
                }
            },
        },
        {
            command: ['remove reminder', 'clear reminder'],
            callback: () => {
                if (!reminderMenuOpen) return;

                dispatch(setReminder(null));
                dispatch(closeReminderMenu());
            },
        },

        // Collaborator Commands
        {
            command: ['add collaborator', 'share with user', 'invite', 'done'],
            callback: () => {
                dispatch(toggleCollaboratorMenu());
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.6,
        },
        {
            command: collabCommandPrefixes.userSearch,
            callback: (fullPhrase: string) => {
                if (!collaboratorMenuOpen) {
                    dispatch(toggleCollaboratorMenu());
                }

                const cleanUserName = extractCleanUserName(
                    fullPhrase,
                    collabCommandPrefixes.userSearch
                );

                dispatch(setCollaboratorSearchTerm(cleanUserName));
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.7,
        },
        {
            command: ['clear user search', 'reset user search'],
            callback: () => {
                if (!collaboratorMenuOpen) {
                    dispatch(toggleCollaboratorMenu());
                }

                dispatch(setCollaboratorSearchTerm(''));
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.7,
        },
        {
            command: collabCommandPrefixes.selectUser,
            callback: (fullPhrase: string) => {
                if (!collaboratorMenuOpen) {
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
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.7,
        },
        {
            command: collabCommandPrefixes.removeUser,
            callback: (fullPhrase: string) => {
                if (!collaboratorMenuOpen) {
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
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.7,
        },

        //Set Label Commands
        {
            command: ['open label menu', 'open take menu'],
            callback: () => {
                dispatch(toggleLabelMenu());
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.7,
        },
        {
            command: ['take search *', 'label find *', 'look for label *'],
            callback: (labelName: string) => {
                const cleanLabelName = labelName.replace(
                    /^(search label|find label|look for label)\s+/i,
                    ''
                );
                if (refs.labelSearchRef.current) {
                    refs.labelSearchRef.current.value = cleanLabelName;
                    dispatch(setSearchQuery(cleanLabelName));
                }
            },
        },
        {
            command: ['clear take search', 'reset take search'],
            callback: () => {
                dispatch(setSearchQuery(''));
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.7,
        },
        {
            command: ['create label', 'create tag'],
            callback: () => {
                handlers.onAddLabel();
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.7,
        },
        {
            command: ['take with *', 'label with *'],
            callback: (fullPhrase: string) => {
                const cleanLabelName = extractCleanUserName(fullPhrase, [
                    'take with',
                    'label with',
                ]);

                if (cleanLabelName) {
                    handlers.handleToggleLabel(cleanLabelName);
                }
            },
        },

        // Checkbox Commands
        {
            command: ['add checkbox *', 'add item *', 'add task *'],
            callback: (fullPhrase: string) => {
                const cleanText = extractCleanUserName(fullPhrase, [
                    'add checkbox',
                    'add item',
                    'add task',
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
            command: ['mark task * as done', 'complete task *', 'check task *'],
            callback: (fullPhrase: string) => {
                const cleanTaskText = extractCleanUserName(fullPhrase, [
                    'mark task',
                    'complete task',
                    'check task',
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
        {
            command: ['show checkboxes', 'show tasks', 'show list'],
            callback: () => {
                dispatch(toggleCbox());
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.7,
        },

        // Background colour
        {
            command: ['colour options'],
            callback: () => {
                dispatch(toggleColorMenu());
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.7,
        },
        {
            command: 'set colour *',
            callback: (fullPhrase: string) => {},
        },
    ];
};
