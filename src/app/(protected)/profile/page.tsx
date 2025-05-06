import Profile from '@/components/profile';
import {
    Label,
    Preferences,
    UserProfile,
    UserStats,
    VoiceStats,
} from '@/types/profile';
import React from 'react';

const ProfilePage: React.FC = () => {
    // Sample data - replace with real data from your API/state
    const user: UserProfile = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        photoUrl:
            'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?t=st=1746532076~exp=1746535676~hmac=cda4cf154965a8f6e9660ea80d22ad065e732f580db367b7112355220e8d79ff&w=740',
        createdAt: 'January 15, 2023',
        lastLogin: 'Today, 10:30 AM',
    };

    const stats: UserStats = {
        totalNotes: 142,
        totalChecklists: 28,
        totalVoiceNotes: 37,
        totalReminders: 19,
        archivedNotes: 12,
        trashedNotes: 5,
    };

    const voiceStats: VoiceStats = {
        totalMinutesTranscribed: 87,
        lastVoiceCommand: 'Create shopping list',
        preferredLanguage: 'English (US)',
        voiceTipsEnabled: true,
    };

    const labels: Label[] = [
        { id: '1', name: 'Work' },
        { id: '2', name: 'Personal' },
        { id: '3', name: 'Shopping' },
        { id: '4', name: 'Ideas' },
        { id: '5', name: 'Important' },
    ];

    const preferences: Preferences = {
        defaultView: 'grid',
        defaultNoteColor: '#ffffff',
        appTheme: 'dark',
        speechToTextLanguage: 'English (US)',
        defaultReminderTime: '9:00 AM',
    };

    return (
        <Profile
            user={user}
            stats={stats}
            voiceStats={voiceStats}
            labels={labels}
            preferences={preferences}
        />
    );
};

export default ProfilePage;
