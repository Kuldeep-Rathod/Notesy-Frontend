'use client';

import styles from '@/styles/components/profile/ProfileHeader.module.scss';
import Image from 'next/image';
import React from 'react';
import { UserProfile } from '../../types/profile';

interface ProfileHeaderProps {
    user: UserProfile;
    onEditPhoto: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEditPhoto }) => {
    if (!user) {
        return (
            <div className={styles.profileHeaderLoading}>
                Loading profile...
            </div>
        );
    }

    return (
        <div className={styles.profileHeader}>
            <div className={styles.profilePhotoContainer}>
                {user.photoUrl ? (
                    <Image
                        src={user.photoUrl}
                        alt='Profile'
                        width={100}
                        height={100}
                        className={styles.profilePhoto}
                    />
                ) : (
                    <div className={styles.defaultProfilePhoto}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                )}

                <button
                    onClick={onEditPhoto}
                    className={styles.editPhotoButton}
                >
                    Edit Photo
                </button>
            </div>
            <div className={styles.profileInfo}>
                <h2 className={styles.profileName}>{user.name}</h2>
                <p className={styles.profileEmail}>{user.email}</p>
                {user.createdAt && (
                    <p className={styles.profileMeta}>
                        Account created:{' '}
                        {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                )}
                {user.lastLogin && (
                    <p className={styles.profileMeta}>
                        Last active:{' '}
                        {new Date(user.lastLogin).toLocaleDateString()}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProfileHeader;
