'use client';

import Profile from '@/components/profile';
import usePageVoiceCommands from '@/hooks/usePageVoiceCommands';
import {
    Label,
    Preferences,
    UserProfile,
    UserStats,
    VoiceStats,
} from '@/types/profile';
import { useState } from 'react';
import { toast } from 'sonner';

const ProfilePage = () => {
    // State for different profile sections
    const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | 'stats'>('profile');

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

    // Set up voice commands for this page
    const { isActive } = usePageVoiceCommands(
        {
            '/profile': [
                {
                    command: ['show profile', 'view profile', 'go to profile section'],
                    callback: () => {
                        setActiveSection('profile');
                        toast.info('Showing profile section');
                    },
                    isFuzzyMatch: true,
                    fuzzyMatchingThreshold: 0.7,
                },
                {
                    command: ['show preferences', 'view preferences', 'go to preferences'],
                    callback: () => {
                        setActiveSection('preferences');
                        toast.info('Showing preferences section');
                    },
                    isFuzzyMatch: true,
                    fuzzyMatchingThreshold: 0.7,
                },
                {
                    command: ['show statistics', 'view stats', 'show activity', 'show insights'],
                    callback: () => {
                        setActiveSection('stats');
                        toast.info('Showing statistics section');
                    },
                    isFuzzyMatch: true,
                    fuzzyMatchingThreshold: 0.7,
                },
                {
                    command: ['tell me about my notes', 'how many notes do I have'],
                    callback: () => {
                        toast.info(`You have ${stats.totalNotes} notes, including ${stats.totalChecklists} checklists`);
                    },
                },
                {
                    command: ['update profile picture', 'change my photo'],
                    callback: () => {
                        toast.info('Voice command: To change your profile picture, click on your current photo');
                    },
                },
            ],
        },
        { debug: true, requireWakeWord: true }
    );

    return (
        <>
            <Profile
                user={user}
                stats={stats}
                voiceStats={voiceStats}
                labels={labels}
                preferences={preferences}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
            />
            
            {isActive && (
                <div 
                    style={{
                        position: 'fixed',
                        bottom: '80px',
                        right: '20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        zIndex: 100,
                    }}
                >
                    Profile voice commands active
                </div>
            )}
        </>
    );
};

export default ProfilePage;
