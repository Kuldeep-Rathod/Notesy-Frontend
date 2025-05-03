'use client';

import Notes from '@/components/NoteCard';
import NoteInput from '@/components/NoteInput';
import { useState } from 'react';

function Page() {
    const [recentlyAdded, setRecentlyAdded] = useState(false);

    const handleSuccess = () => {
        setRecentlyAdded(true);
        // You might want to refresh your notes list here
    };
    return (
        <div>
            <NoteInput onSuccess={handleSuccess} />
            <Notes />
        </div>
    );
}

export default Page;
