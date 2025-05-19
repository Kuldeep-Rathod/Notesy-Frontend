import { quickOptions } from '@/components/notes/input/ReminderPicker';
import { LabelI } from '@/interfaces/labels';
import {
    addChecklist,
    setLabels,
    setReminder,
    setSearchQuery,
    toggleCbox,
    toggleLabel,
    toggleLabelMenu,
    toggleReminderMenu,
    updateChecklist,
    closeReminderMenu,
    selectNoteInput,
    toggleCollaboratorMenu,
    setCollaboratorSearchTerm,
} from '@/redux/reducer/noteInputReducer';
import { setDate } from 'date-fns';
import { format } from 'path';
import { useDispatch, useSelector } from 'react-redux';

interface NoteCommandsParams {
    refs: {
        noteTitleRef: React.RefObject<HTMLDivElement>;
        noteBodyRef: React.RefObject<HTMLDivElement>;
        labelSearchRef: React.RefObject<HTMLInputElement>;
    };
    setters: {
        setCollaborators: (emails: string[]) => void;
    };
    labels: LabelI[];
}

export const useNoteCommands = ({
    refs,
    setters,
    labels,
}: NoteCommandsParams) => {
    const dispatch = useDispatch();

    const {
        tooltips: {
            moreMenuOpen,
            colorMenuOpen,
            collaboratorMenuOpen,
            reminderMenuOpen,
        },
    } = useSelector(selectNoteInput);

    return [
        // Title and Body Commands
        {
            command: ['set title *', 'title is *', 'note title *'],
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
            command: ['set description *', 'note content *', 'write *'],
            callback: (content: string) => {
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

        //Commands for set reminders
        {
            command: ['set reminder', 'schedule reminder'],
            callback: () => {
                dispatch(toggleReminderMenu());
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.6,
        },
        // {
        //     command: ['remind me *', 'set reminder for *'],
        //     callback: (dateInput: string) => {
        //         console.log('Raw date input:', dateInput);

        //         const cleanDate = dateInput.replace(
        //             /^(remind me|set reminder for)\s+/i,
        //             ''
        //         );
        //         console.log('cleanDate:', cleanDate);

        //         const reminder = quickOptions.find((option) =>
        //             option.label.toLowerCase().includes(cleanDate.toLowerCase())
        //         );

        //         if (reminder) {
        //             const selectedDate = reminder.time();
        //             console.log(
        //                 'Setting reminder:',
        //                 reminder.label,
        //                 selectedDate
        //             );
        //             dispatch(setReminder(selectedDate.toISOString()));
        //             dispatch(closeReminderMenu());
        //         } else {
        //             console.log(
        //                 'No matching quick option found for:',
        //                 cleanDate
        //             );
        //         }
        //     },
        //     isFuzzyMatch: true,
        //     fuzzyMatchingThreshold: 0.7,
        // },
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

        // // Collaborator Commands
        // {
        //     command: ['add collaborator', 'share with', 'invite'],
        //     callback: () => {
        //         dispatch(toggleCollaboratorMenu());
        //     },
        //     isFuzzyMatch: true,
        //     fuzzyMatchingThreshold: 0.6,
        // },
        // {
        //     command: ['user search *', 'user find *', 'look for user *'],
        //     callback: (userName: string) => {
        //         if (collaboratorMenuOpen) return;

        //         const cleanUserName = userName.replace(
        //             /^(user search|user find|look for user)\s+/i,
        //             ''
        //         );

        //         console.log('cleanUserName', cleanUserName);

        //         dispatch(setCollaboratorSearchTerm(cleanUserName));
        //     },
        // },

        // //Set Label Commands
        // {
        //     command: ['add label *', 'take with *', 'label as *'],
        //     callback: () => {
        //         dispatch(toggleLabelMenu());
        //     },
        //     isFuzzyMatch: true,
        //     fuzzyMatchingThreshold: 0.7,
        // },
        // {
        //     command: ['take search *', 'label find *', 'look for label *'],
        //     callback: (labelName: string) => {
        //         const cleanLabelName = labelName.replace(
        //             /^(search label|find label|look for label)\s+/i,
        //             ''
        //         );
        //         if (refs.labelSearchRef.current) {
        //             refs.labelSearchRef.current.value = cleanLabelName;
        //             dispatch(setSearchQuery(cleanLabelName));
        //         }
        //     },
        // },
        // {
        //     command: ['remove label *', 'delete label *', 'untag *'],
        //     callback: (labelName: string) => {
        //         const cleanLabelName = labelName.replace(
        //             /^(remove label|delete label|untag)\s+/i,
        //             ''
        //         );
        //         const label = labels.find(
        //             (l) => l.name.toLowerCase() === cleanLabelName.toLowerCase()
        //         );
        //         if (label && label.added) {
        //             dispatch(toggleLabel(label.name));
        //         }
        //     },
        //     isFuzzyMatch: true,
        //     fuzzyMatchingThreshold: 0.7,
        // },

        // // Checkbox Commands
        // {
        //     command: ['add checkbox *', 'add item *', 'add task *'],
        //     callback: (text: string) => {
        //         const cleanText = text.replace(
        //             /^(add checkbox|add item|add task)\s+/i,
        //             ''
        //         );
        //         dispatch(toggleCbox());
        //         dispatch(
        //             addChecklist({
        //                 id: Date.now(),
        //                 text: cleanText,
        //                 checked: false,
        //             })
        //         );
        //     },
        //     isFuzzyMatch: true,
        //     fuzzyMatchingThreshold: 0.7,
        // },
        // {
        //     command: ['mark task * as done', 'complete task *', 'check task *'],
        //     callback: (taskText: string) => {
        //         const cleanTaskText = taskText.replace(
        //             /^(mark task|complete task|check task)\s+/i,
        //             ''
        //         );
        //         const task = labels.find((l) =>
        //             l.name.toLowerCase().includes(cleanTaskText.toLowerCase())
        //         );
        //         if (task) {
        //             dispatch(
        //                 updateChecklist({
        //                     id: task.name,
        //                     updates: { checked: true },
        //                 })
        //             );
        //         }
        //     },
        //     isFuzzyMatch: true,
        //     fuzzyMatchingThreshold: 0.7,
        // },
        // {
        //     command: ['show checkboxes', 'show tasks', 'show list'],
        //     callback: () => {
        //         dispatch(toggleCbox());
        //     },
        //     isFuzzyMatch: true,
        //     fuzzyMatchingThreshold: 0.7,
        // },
    ];
};
