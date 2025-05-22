'use client';

import NotesContainer from '@/components/notes/NotesContainer';
import { useState } from 'react';

const BinNotesPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

    return (
        <NotesContainer
            initialViewType={viewType}
            initialSearchQuery={searchQuery}
            onViewTypeChange={setViewType}
            onSearchQueryChange={setSearchQuery}
            filterType='trash'
        />
    );
};

export default BinNotesPage;
