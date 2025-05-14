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
    reminder?: Date | string | null;
    sharedWith?: string[];
    collaborators?: CollaboratorI[];
    trashed?: boolean;
    archived?: boolean;
    bgImage?: string;
    isCbox?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface CollaboratorI {
    firebaseUid: string;
    name?: string;
    email?: string;
    photo?: string;
}

export interface CheckboxI {
    checked: boolean;
    text: string;
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
