'use client';

import NotesContainer from '@/components/notes/NotesContainer';
import { useState } from 'react';

function ArchivedNotesPage() {
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div>
            <NotesContainer
                initialViewType={viewType}
                initialSearchQuery={searchQuery}
                filterType='archive'
                onViewTypeChange={setViewType}
                onSearchQueryChange={setSearchQuery}
            />
        </div>
    );
}

export default ArchivedNotesPage;
