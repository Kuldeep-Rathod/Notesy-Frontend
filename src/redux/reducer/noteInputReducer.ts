// redux/features/noteInput/noteInputSlice.ts
import { LabelI } from '@/interfaces/labels';
import { CheckboxI } from '@/interfaces/notes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
        imageMenuOpen: boolean;
        reminderMenuOpen: boolean;
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

    noteTitle: string;
    noteBody: string;
    images: File[];
    imagePreviews: string[];
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
        imageMenuOpen: false,
        reminderMenuOpen: false,
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

    noteTitle: '',
    noteBody: '',
    images: [],
    imagePreviews: [],
};

export const noteInputReducer = createSlice({
    name: 'noteInput',
    initialState,
    reducers: {
        // Checklists
        setChecklists: (
            state,
            action: PayloadAction<
                (
                    | CheckboxI
                    | {
                          id: string | number;
                          checked: boolean;
                          text: string;
                          _id?: string;
                      }
                )[]
            >
        ) => {
            state.checklists = action.payload as CheckboxI[];
        },
        addChecklist: (state, action: PayloadAction<CheckboxI>) => {
            state.checklists.push(action.payload);
        },
        updateChecklist: (
            state,
            action: PayloadAction<{
                id: number | string;
                updates: Partial<CheckboxI>;
            }>
        ) => {
            const index = state.checklists.findIndex(
                (cb) =>
                    cb.id === action.payload.id || cb._id === action.payload.id
            );
            if (index !== -1) {
                state.checklists[index] = {
                    ...state.checklists[index],
                    ...action.payload.updates,
                };
            }
        },
        removeChecklist: (state, action: PayloadAction<number | string>) => {
            state.checklists = state.checklists.filter(
                (cb) => cb.id !== action.payload && cb._id !== action.payload
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
                state.tooltips.imageMenuOpen = false;
                state.tooltips.collaboratorMenuOpen = false;
            }
        },
        toggleColorMenu: (state) => {
            state.tooltips.colorMenuOpen = !state.tooltips.colorMenuOpen;
            if (state.tooltips.colorMenuOpen) {
                state.tooltips.labelMenuOpen = false;
                state.tooltips.moreMenuOpen = false;
                state.tooltips.imageMenuOpen = false;
                state.tooltips.collaboratorMenuOpen = false;
            }
        },
        toggleImageMenu: (state) => {
            state.tooltips.imageMenuOpen = !state.tooltips.imageMenuOpen;
            if (state.tooltips.imageMenuOpen) {
                state.tooltips.labelMenuOpen = false;
                state.tooltips.colorMenuOpen = false;
                state.tooltips.moreMenuOpen = false;
                state.tooltips.collaboratorMenuOpen = false;
            }
        },
        toggleLabelMenu: (state) => {
            state.tooltips.labelMenuOpen = !state.tooltips.labelMenuOpen;
            if (state.tooltips.labelMenuOpen) {
                state.tooltips.moreMenuOpen = false;
                state.tooltips.colorMenuOpen = false;
                state.tooltips.imageMenuOpen = false;
                state.tooltips.collaboratorMenuOpen = false;
            }
        },
        toggleReminderMenu: (state) => {
            state.tooltips.reminderMenuOpen = !state.tooltips.reminderMenuOpen;
            if (state.tooltips.reminderMenuOpen) {
                state.tooltips.moreMenuOpen = false;
                state.tooltips.colorMenuOpen = false;
                state.tooltips.labelMenuOpen = false;
                state.tooltips.imageMenuOpen = false;
                state.tooltips.collaboratorMenuOpen = false;
            }
        },
        toggleCollaboratorMenu: (state) => {
            state.tooltips.collaboratorMenuOpen =
                !state.tooltips.collaboratorMenuOpen;
            if (state.tooltips.collaboratorMenuOpen) {
                state.tooltips.moreMenuOpen = false;
                state.tooltips.colorMenuOpen = false;
                state.tooltips.labelMenuOpen = false;
                state.tooltips.imageMenuOpen = false;
            }
        },

        closeAllTooltips: (state) => {
            state.tooltips.moreMenuOpen = false;
            state.tooltips.colorMenuOpen = false;
            state.tooltips.labelMenuOpen = false;
            state.tooltips.imageMenuOpen = false;
            state.tooltips.reminderMenuOpen = false;
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
        closeReminderMenu: (state) => {
            state.tooltips.reminderMenuOpen = false;
        },
        setImages: (state, action: PayloadAction<File[]>) => {
            state.images = action.payload;
        },
        setImagePreviews: (state, action: PayloadAction<string[]>) => {
            state.imagePreviews = action.payload;
        },
        removeImage: (state, action: PayloadAction<number>) => {
            state.images = state.images.filter(
                (_, index) => index !== action.payload
            );
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
    toggleImageMenu,
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
    setImages,
    setImagePreviews,
    removeImage,
} = noteInputReducer.actions;

export default noteInputReducer.reducer;
// At the bottom of your noteInputReducer.ts file
export const selectNoteInput = (state: RootState) => state.noteInput;
