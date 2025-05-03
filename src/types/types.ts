import { LabelI } from '@/interfaces/labels';
import { CheckboxI, NoteI } from '@/interfaces/notes';

export interface NoteInputProps {
    isEditing?: boolean;
    noteToEdit?: NoteI;
    onSave?: (note: NoteI) => void;
    onClose?: () => void;
}

export interface NoteInputState {
    checkBoxes: CheckboxI[];
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
