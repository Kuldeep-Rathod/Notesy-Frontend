'use client';

import NoteInput from '@/components/notes/NoteInput';
import NotesContainer from '@/components/notes/NotesContainer';
import { useRef, useState } from 'react';

function Page() {
    const [recentlyAdded, setRecentlyAdded] = useState(false);
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const noteInputRef = useRef<HTMLDivElement>(null);

    const handleSuccess = () => {
        setRecentlyAdded(true);
    };

    // Track modal state from NotesContainer
    const handleModalStateChange = (isOpen: boolean) => {
        setIsModalOpen(isOpen);
    };

    return (
        <div>
            {/* Only render the main NoteInput when modal is not open */}
            {!isModalOpen && (
                <div ref={noteInputRef}>
                    <NoteInput onSuccess={handleSuccess} />
                </div>
            )}

            <NotesContainer
                initialViewType={viewType}
                initialSearchQuery={searchQuery}
                onViewTypeChange={setViewType}
                onSearchQueryChange={setSearchQuery}
                onModalStateChange={handleModalStateChange}
            />
        </div>
    );
}

export default Page;
