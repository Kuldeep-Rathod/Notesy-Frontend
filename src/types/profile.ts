export interface UserProfile {
    name: string;
    email: string;
    photoUrl: string;
    createdAt?: string;
    lastLogin?: string;
}

export interface UserStats {
    totalNotes: number;
    totalChecklists: number;
    totalVoiceNotes: number;
    totalReminders: number;
    archivedNotes: number;
    trashedNotes: number;
}

export interface VoiceStats {
    totalMinutesTranscribed: number;
    lastVoiceCommand: string;
    preferredLanguage: string;
    voiceTipsEnabled: boolean;
}

export interface Label {
    id: string;
    name: string;
    count?: number;
}

export interface Preferences {
    defaultView: 'grid' | 'list';
    defaultNoteColor: string;
    appTheme: 'light' | 'dark' | 'system';
    speechToTextLanguage: string;
    defaultReminderTime: string;
}
