import React from 'react';
import styles from '@/styles/components/profile/ProfileHeader.module.scss';
import { UserProfile } from '../../types/profile';
import Image from 'next/image';

interface ProfileHeaderProps {
    user: UserProfile;
    onEditPhoto: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEditPhoto }) => {
    return (
        <div className={styles.profileHeader}>
            <div className={styles.profilePhotoContainer}>
                <Image
                    src={user.photoUrl}
                    alt='Profile'
                    width={100}
                    height={100}
                    className={styles.profilePhoto}
                />

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
                <p className={styles.profileMeta}>
                    Account created: {user.createdAt}
                </p>
                <p className={styles.profileMeta}>
                    Last login: {user.lastLogin}
                </p>
            </div>
        </div>
    );
};

export default ProfileHeader;
