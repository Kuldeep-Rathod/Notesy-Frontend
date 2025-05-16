'use client';

import Profile from '@/components/profile';
import usePageVoiceCommands from '@/voice-assistant/hooks/usePageVoiceCommands';
import { UserStats } from '@/types/profile';
import { useState } from 'react';
import { toast } from 'sonner';

const ProfilePage = () => {
    // State for different profile sections
    const [activeSection, setActiveSection] = useState<
        'profile' | 'preferences' | 'stats'
    >('profile');

    // Sample stats data - this would normally come from an API
    const stats: UserStats = {
        totalNotes: 142,
        totalChecklists: 28,
        totalVoiceNotes: 37,
        totalReminders: 19,
        archivedNotes: 12,
        trashedNotes: 5,
    };

    // Set up voice commands for this page
    const { isActive } = usePageVoiceCommands(
        {
            '/profile': [
                {
                    command: [
                        'show profile',
                        'view profile',
                        'go to profile section',
                    ],
                    callback: () => {
                        setActiveSection('profile');
                        toast.info('Showing profile section');
                    },
                    isFuzzyMatch: true,
                    fuzzyMatchingThreshold: 0.7,
                },
                {
                    command: [
                        'show preferences',
                        'view preferences',
                        'go to preferences',
                    ],
                    callback: () => {
                        setActiveSection('preferences');
                        toast.info('Showing preferences section');
                    },
                    isFuzzyMatch: true,
                    fuzzyMatchingThreshold: 0.7,
                },
                {
                    command: [
                        'show statistics',
                        'view stats',
                        'show activity',
                        'show insights',
                    ],
                    callback: () => {
                        setActiveSection('stats');
                        toast.info('Showing statistics section');
                    },
                    isFuzzyMatch: true,
                    fuzzyMatchingThreshold: 0.7,
                },
                {
                    command: [
                        'tell me about my notes',
                        'how many notes do I have',
                    ],
                    callback: () => {
                        toast.info(
                            `You have ${stats.totalNotes} notes, including ${stats.totalChecklists} checklists`
                        );
                    },
                },
                {
                    command: ['update profile picture', 'change my photo'],
                    callback: () => {
                        toast.info(
                            'Voice command: To change your profile picture, click on your current photo'
                        );
                    },
                },
            ],
        },
        { debug: true, requireWakeWord: true }
    );

    return (
        <>
            <Profile
                stats={stats}
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
