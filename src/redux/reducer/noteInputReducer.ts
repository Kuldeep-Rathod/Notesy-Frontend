// redux/features/noteInput/noteInputSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LabelI } from '@/interfaces/labels';
import { CheckboxI } from '@/interfaces/notes';
import { bgColors, bgImages } from '@/interfaces/tooltip';
import { RootState } from '../store';

interface NoteInputState {
    checklists: CheckboxI[];
    labels: LabelI[];
    availableLabels: LabelI[];
    isArchived: boolean;
    isTrashed: boolean;
    isPinned: boolean;
    isCbox: boolean;
    isCboxCompletedListCollapsed: boolean;
    isListening: boolean;
    transcript: string;
    activeField: 'title' | 'body' | null;
    inputLength: {
        title: number;
        body: number;
        cb: number;
    };
    tooltips: {
        moreMenuOpen: boolean;
        colorMenuOpen: boolean;
        labelMenuOpen: boolean;
        collaboratorMenuOpen: boolean;
    };
    searchQuery: string;
    noteAppearance: {
        bgColor: string;
        bgImage: string;
    };
    collaborators: {
        selectedUsers: { uid: string; email: string; name: string }[];
        searchTerm: string;
        isSearching: boolean;
    };
    reminder: string | null;
    reminderMenuOpen: boolean;
}

const initialState: NoteInputState = {
    checklists: [],
    labels: [],
    availableLabels: [],
    isArchived: false,
    isTrashed: false,
    isPinned: false,
    isCbox: false,
    isCboxCompletedListCollapsed: false,
    isListening: false,
    transcript: '',
    activeField: null,
    inputLength: {
        title: 0,
        body: 0,
        cb: 0,
    },
    tooltips: {
        moreMenuOpen: false,
        colorMenuOpen: false,
        labelMenuOpen: false,
        collaboratorMenuOpen: false,
    },
    searchQuery: '',
    noteAppearance: {
        bgColor: '',
        bgImage: '',
    },
    collaborators: {
        selectedUsers: [],
        searchTerm: '',
        isSearching: false,
    },
    reminder: null,
    reminderMenuOpen: false,
};

export const noteInputReducer = createSlice({
    name: 'noteInput',
    initialState,
    reducers: {
        // Checklists
        setChecklists: (state, action: PayloadAction<CheckboxI[]>) => {
            state.checklists = action.payload;
        },
        addChecklist: (state, action: PayloadAction<CheckboxI>) => {
            state.checklists.push(action.payload);
        },
        updateChecklist: (
            state,
            action: PayloadAction<{ id: number; updates: Partial<CheckboxI> }>
        ) => {
            const index = state.checklists.findIndex(
                (cb) => cb.id === action.payload.id
            );
            if (index !== -1) {
                state.checklists[index] = {
                    ...state.checklists[index],
                    ...action.payload.updates,
                };
            }
        },
        removeChecklist: (state, action: PayloadAction<number>) => {
            state.checklists = state.checklists.filter(
                (cb) => cb.id !== action.payload
            );
        },

        // Labels
        setLabels: (state, action: PayloadAction<LabelI[]>) => {
            state.labels = action.payload;
        },
        setAvailableLabels: (state, action: PayloadAction<LabelI[]>) => {
            state.availableLabels = action.payload;
        },
        toggleLabel: (state, action: PayloadAction<string>) => {
            const label = state.labels.find((l) => l.name === action.payload);
            if (label) {
                label.added = !label.added;
            }
        },

        // Toggles
        togglePinned: (state) => {
            state.isPinned = !state.isPinned;
        },
        toggleCbox: (state) => {
            state.isCbox = !state.isCbox;
        },
        toggleCboxCompletedList: (state) => {
            state.isCboxCompletedListCollapsed =
                !state.isCboxCompletedListCollapsed;
        },
        toggleArchive: (state) => {
            state.isArchived = !state.isArchived;
        },
        toggleTrash: (state) => {
            state.isTrashed = !state.isTrashed;
        },

        // Tooltips
        toggleMoreMenu: (state) => {
            state.tooltips.moreMenuOpen = !state.tooltips.moreMenuOpen;
            if (state.tooltips.moreMenuOpen) {
                state.tooltips.labelMenuOpen = false;
                state.tooltips.colorMenuOpen = false;
            }
        },
        toggleColorMenu: (state) => {
            state.tooltips.colorMenuOpen = !state.tooltips.colorMenuOpen;
            if (state.tooltips.colorMenuOpen) {
                state.tooltips.labelMenuOpen = false;
                state.tooltips.moreMenuOpen = false;
            }
        },
        toggleLabelMenu: (state) => {
            state.tooltips.labelMenuOpen = !state.tooltips.labelMenuOpen;
            if (state.tooltips.labelMenuOpen) {
                state.tooltips.moreMenuOpen = false;
                state.tooltips.colorMenuOpen = false;
            }
        },
        closeAllTooltips: (state) => {
            state.tooltips.moreMenuOpen = false;
            state.tooltips.colorMenuOpen = false;
            state.tooltips.labelMenuOpen = false;
        },

        // Appearance
        setBgColor: (state, action: PayloadAction<string>) => {
            state.noteAppearance.bgColor = action.payload;
        },
        setBgImage: (state, action: PayloadAction<string>) => {
            state.noteAppearance.bgImage = action.payload;
        },

        // Search
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },

        // Speech recognition
        setListening: (state, action: PayloadAction<boolean>) => {
            state.isListening = action.payload;
        },
        setTranscript: (state, action: PayloadAction<string>) => {
            state.transcript = action.payload;
        },
        setActiveField: (
            state,
            action: PayloadAction<'title' | 'body' | null>
        ) => {
            state.activeField = action.payload;
        },

        // Input length
        updateInputLength: (
            state,
            action: PayloadAction<{
                title?: number;
                body?: number;
                cb?: number;
            }>
        ) => {
            state.inputLength = {
                ...state.inputLength,
                ...action.payload,
            };
        },

        // Reset
        resetNoteInput: () => initialState,

        // Collaboration
        toggleCollaboratorMenu: (state) => {
            state.tooltips.collaboratorMenuOpen =
                !state.tooltips.collaboratorMenuOpen;
            if (state.tooltips.collaboratorMenuOpen) {
                state.tooltips.moreMenuOpen = false;
                state.tooltips.colorMenuOpen = false;
                state.tooltips.labelMenuOpen = false;
            }
        },
        setCollaboratorSearchTerm: (state, action: PayloadAction<string>) => {
            state.collaborators.searchTerm = action.payload;
        },
        setCollaboratorSearching: (state, action: PayloadAction<boolean>) => {
            state.collaborators.isSearching = action.payload;
        },
        addCollaborator: (
            state,
            action: PayloadAction<{ uid: string; email: string; name: string }>
        ) => {
            if (
                !state.collaborators.selectedUsers.some(
                    (user) => user.uid === action.payload.uid
                )
            ) {
                state.collaborators.selectedUsers.push(action.payload);
            }
        },
        removeCollaborator: (state, action: PayloadAction<string>) => {
            state.collaborators.selectedUsers =
                state.collaborators.selectedUsers.filter(
                    (user) => user.uid !== action.payload
                );
        },
        clearCollaborators: (state) => {
            state.collaborators.selectedUsers = [];
            state.collaborators.searchTerm = '';
            state.collaborators.isSearching = false;
        },
        setReminder: (state, action: PayloadAction<string | null>) => {
            state.reminder = action.payload;
        },
        toggleReminderMenu: (state) => {
            state.reminderMenuOpen = !state.reminderMenuOpen;
        },
        closeReminderMenu: (state) => {
            state.reminderMenuOpen = false;
        },
    },
});

export const {
    setChecklists,
    addChecklist,
    updateChecklist,
    removeChecklist,
    setLabels,
    setAvailableLabels,
    toggleLabel,
    togglePinned,
    toggleCbox,
    toggleCboxCompletedList,
    toggleArchive,
    toggleTrash,
    toggleMoreMenu,
    toggleColorMenu,
    toggleLabelMenu,
    closeAllTooltips,
    setBgColor,
    setBgImage,
    setSearchQuery,
    setListening,
    setTranscript,
    setActiveField,
    updateInputLength,
    resetNoteInput,
    toggleCollaboratorMenu,
    setCollaboratorSearchTerm,
    setCollaboratorSearching,
    addCollaborator,
    removeCollaborator,
    clearCollaborators,
    setReminder,
    toggleReminderMenu,
    closeReminderMenu,
} = noteInputReducer.actions;

export default noteInputReducer.reducer;
// At the bottom of your noteInputReducer.ts file
export const selectNoteInput = (state: RootState) => state.noteInput;
