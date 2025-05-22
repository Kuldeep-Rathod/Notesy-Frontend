'use client';

import NotesContainer from '@/components/notes/NotesContainer';
import '@/styles/components/notes/_noteCard.scss';
import { useState } from 'react';

const ReminderNotesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

    return (
        <div>
            <NotesContainer
                initialViewType={viewType}
                initialSearchQuery={searchQuery}
                onViewTypeChange={setViewType}
                onSearchQueryChange={setSearchQuery}
                filterType='reminder'
            />
        </div>
    );
};

export default ReminderNotesPage;
