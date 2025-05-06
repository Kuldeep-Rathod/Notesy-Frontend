import { LabelI } from './labels';

export interface NoteI {
    _id?: string;
    firebaseUid?: string;
    noteTitle?: string;
    noteBody?: string;
    audio?: {
        url?: string;
        transcription?: string;
    };
    checklists?: CheckboxI[];
    bgColor?: string;
    labels?: string[] | LabelI[];
    pinned?: boolean;
    reminder?: string | Date;
    sharedWith?: string[];
    trashed?: boolean;
    archived?: boolean;
    bgImage?: string;
    isCbox?: boolean;
}

export interface CheckboxI {
    checked: boolean;
    text: any;
    id: number;
}

export type UpdateKeyI = {
    [key in keyof NoteI]?: any;
};

export interface NoteModelI {
    id: number;
    pinned: NoteI[];
    unpinned: NoteI[];
    all: NoteI[];
    db: {
        add(data: NoteI): Promise<number>;
        update(data: NoteI): void;
        updateKey(object: UpdateKeyI): void;
        updateAllLabels(labelId: number, labelValue: string): void;
        get(): Promise<NoteI>;
        clone(): void;
        delete(): void;
        trash(): void;
    };
}
