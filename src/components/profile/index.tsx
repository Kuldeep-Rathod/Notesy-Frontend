'use client';

import React, { useState, useEffect } from 'react';
import {
    Label,
    Preferences,
    UserProfile,
    UserStats,
    VoiceStats,
} from '../../types/profile';
import LabelItem from './LabelItem';
import ProfileHeader from './ProfileHeader';
import ProfileSection from './ProfileSection';
import StatCard from './StatCard';
import styles from '@/styles/components/profile/index.module.scss';

interface ProfileProps {
    user: UserProfile;
    stats: UserStats;
    voiceStats: VoiceStats;
    labels: Label[];
    preferences: Preferences;
    activeSection?: 'profile' | 'preferences' | 'stats';
    onSectionChange?: (section: 'profile' | 'preferences' | 'stats') => void;
}

const Profile: React.FC<ProfileProps> = ({
    user,
    stats,
    voiceStats,
    labels,
    preferences,
    activeSection = 'profile',
    onSectionChange,
}) => {
    const [currentLabels, setCurrentLabels] = useState<Label[]>(labels);
    const [newLabel, setNewLabel] = useState('');
    const [localActiveSection, setLocalActiveSection] = useState<'profile' | 'preferences' | 'stats'>(activeSection);
    
    useEffect(() => {
        setLocalActiveSection(activeSection);
    }, [activeSection]);
    
    const handleSectionChange = (section: 'profile' | 'preferences' | 'stats') => {
        setLocalActiveSection(section);
        if (onSectionChange) {
            onSectionChange(section);
        }
    };
    
    const effectiveSection = localActiveSection;

    const handleDeleteLabel = (id: string) => {
        setCurrentLabels(currentLabels.filter((label) => label.id !== id));
    };

    const handleAddLabel = (e: React.FormEvent) => {
        e.preventDefault();
        if (newLabel.trim()) {
            setCurrentLabels([
                ...currentLabels,
                {
                    id: Date.now().toString(),
                    name: newLabel.trim(),
                },
            ]);
            setNewLabel('');
        }
    };

    const handleEditPhoto = () => {
        // Implement photo editing logic
        console.log('Edit photo clicked');
    };

    return (
        <div className={styles.profileContainer}>
            <header className={styles.profilePageHeader}>
                <h1 className={styles.profileTitle}>Your Profile</h1>
            </header>

            <ProfileHeader
                user={user}
                onEditPhoto={handleEditPhoto}
            />

            {/* Core User Info */}
            <ProfileSection
                title='Core User Info'
                onEdit={() => console.log('Edit core info')}
            >
                <div className={styles.preferenceItem}>
                    <span>Name</span>
                    <span>{user.name}</span>
                </div>
                <div className={styles.preferenceItem}>
                    <span>Email</span>
                    <span>{user.email}</span>
                </div>
                <div className={styles.preferenceItem}>
                    <span>Account Creation Date</span>
                    <span>{user.createdAt}</span>
                </div>
                <div className={styles.preferenceItem}>
                    <span>Last Login</span>
                    <span>{user.lastLogin}</span>
                </div>
            </ProfileSection>

            {/* Activity Insights */}
            <ProfileSection title='Your Activity Insights'>
                <div className={styles.statsGrid}>
                    <StatCard
                        title='Total Notes Created'
                        value={stats.totalNotes}
                    />
                    <StatCard
                        title='Total Checklists'
                        value={stats.totalChecklists}
                    />
                    <StatCard
                        title='Reminders Set'
                        value={stats.totalReminders}
                    />
                    <StatCard
                        title='Archived Notes'
                        value={stats.archivedNotes}
                    />
                    <StatCard
                        title='Trashed Notes'
                        value={stats.trashedNotes}
                    />
                </div>
            </ProfileSection>

            {/* Voice Feature Usage */}
            {/* <ProfileSection title='Voice Feature Usage'>
                <div className={styles.statsGrid}>
                    <StatCard
                        title='Total Minutes Transcribed'
                        value={voiceStats.totalMinutesTranscribed}
                    />
                    <StatCard
                        title='Last Voice Command'
                        value={voiceStats.lastVoiceCommand}
                    />
                </div>
                <div className={styles.preferenceItem}>
                    <span>Preferred Speech Language</span>
                    <span>{voiceStats.preferredLanguage}</span>
                </div>
                <div className={styles.preferenceItem}>
                    <span>Voice Tips</span>
                    <label className={styles.toggleSwitch}>
                        <input
                            type='checkbox'
                            checked={voiceStats.voiceTipsEnabled}
                            onChange={() => {}}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </ProfileSection> */}

            {/* Top Labels */}
            <ProfileSection title='Your Top Labels'>
                <div className={styles.statsGrid}>
                    {currentLabels.slice(0, 3).map((label, index) => (
                        <StatCard
                            key={label.id}
                            title={`Most Used Label #${index + 1}`}
                            value={label.name}
                        />
                    ))}
                </div>
            </ProfileSection>

            {/* Labels Management */}
            <ProfileSection title='Labels Management'>
                <div className={styles.labelsList}>
                    {currentLabels.map((label) => (
                        <LabelItem
                            key={label.id}
                            label={label.name}
                            onDelete={() => handleDeleteLabel(label.id)}
                        />
                    ))}
                </div>
                <form
                    onSubmit={handleAddLabel}
                    className={styles.addLabelForm}
                >
                    <input
                        type='text'
                        placeholder='Add new label...'
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                    />
                    <button type='submit'>Add</button>
                </form>
            </ProfileSection>

            {/* Personal Preferences */}
            {/* <ProfileSection
                title='Personal Preferences'
                onEdit={() => console.log('Edit preferences')}
            >
                <div className={styles.preferenceItem}>
                    <span>Default View</span>
                    <span>{preferences.defaultView}</span>
                </div>
                <div className={styles.preferenceItem}>
                    <span>Default Note Color</span>
                    <span>{preferences.defaultNoteColor}</span>
                </div>
                <div className={styles.preferenceItem}>
                    <span>App Theme</span>
                    <span>{preferences.appTheme}</span>
                </div>
                <div className={styles.preferenceItem}>
                    <span>Speech-to-Text Language</span>
                    <span>{preferences.speechToTextLanguage}</span>
                </div>
                <div className={styles.preferenceItem}>
                    <span>Default Reminder Time</span>
                    <span>{preferences.defaultReminderTime}</span>
                </div>
            </ProfileSection> */}

            {/* Account Settings */}
            <ProfileSection title='Account Settings'>
                <div className={styles.accountAction}>
                    <button
                        className={`${styles.button} ${styles.primaryButton}`}
                    >
                        Change Password
                    </button>
                </div>
                <div className={styles.accountAction}>
                    <button
                        className={`${styles.button} ${styles.outlineButton}`}
                    >
                        Export My Data
                    </button>
                </div>

                <div className={styles.accountAction}>
                    <button
                        className={`${styles.button} ${styles.dangerButton}`}
                    >
                        Delete Account
                    </button>
                </div>
            </ProfileSection>
        </div>
    );
};

export default Profile;
