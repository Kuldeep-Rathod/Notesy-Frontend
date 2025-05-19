import { LabelI } from '@/interfaces/labels';
import { CheckboxI, NoteI } from '@/interfaces/notes';

export interface NoteInputProps {
    isEditing?: boolean;
    noteToEdit?: NoteI;
    onSave?: (note: NoteI) => void;
    onClose?: () => void;
    onSuccess?: () => void; // Add this line
}

export type NotesStatsResponse = {
    success: boolean;
    data: {
        totalNotes: number;
        checklistStats: {
            completed: number;
            incomplete: number;
        };
        labelStats: {
            [label: string]: number;
        };
        pinned: number;
        archived: number;
        trashed: number;
        reminderCount: number;
        reminderStats: {
            upcoming: number;
            past: number;
        };
        sharedNotes: number;
        bgColorStats: {
            [color: string]: number;
        };
    };
};

export interface NoteInputState {
    checklists: CheckboxI[];
    labels: LabelI[];
    isArchived: boolean;
    isTrashed: boolean;
    isCboxCompletedListCollapsed: boolean;
    isCbox: boolean;
    inputLength: {
        title: number;
        body: number;
        cb: number;
    };
}

export interface TooltipState {
    moreMenuOpen: boolean;
    colorMenuOpen: boolean;
    labelMenuOpen: boolean;
}

export interface Plan {
    id: string;
    name: string;
    price: number;
    duration: string;
    description: string;
    features: string[];
    popular?: boolean;
    savePercent?: number;
    stripePriceId?: string;
}
