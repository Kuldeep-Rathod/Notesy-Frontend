'use client';

import Profile from '@/components/profile';
import { useNoteStatsQuery } from '@/redux/api/notesAPI';

const ProfilePage = () => {
    const { data: statsData } = useNoteStatsQuery();

    console.log('Stats data:', statsData);

    return (
        <>
            <Profile />
        </>
    );
};

export default ProfilePage;
