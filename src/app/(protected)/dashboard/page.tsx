'use client';

import NoteInput from '@/components/NoteInput';
import NotesContainer from '@/components/notes/NotesContainer';
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
            <NotesContainer />
        </div>
    );
}

export default Page;
