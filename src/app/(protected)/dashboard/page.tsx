'use client';

import NoteInput from '@/components/NoteInput';
import DummyNotes from '@/components/notes/NotesContainer';
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
            <DummyNotes />
        </div>
    );
}

export default Page;
