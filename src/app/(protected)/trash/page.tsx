'use client';

import NotesContainer from '@/components/notes/NotesContainer';
import '@/styles/components/notes/_noteCard.scss';
import { useRef, useState } from 'react';

const BinNotesPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const forwardRefs = (container: HTMLDivElement | null) => {
        if (container) {
            containerRef.current = container;
            const searchInput = container.querySelector('input.search-input');
            if (searchInput instanceof HTMLInputElement) {
                searchInputRef.current = searchInput;
            }
        }
    };

    return (
        <div ref={forwardRefs}>
            <NotesContainer
                initialViewType={viewType}
                initialSearchQuery={searchQuery}
                onViewTypeChange={setViewType}
                onSearchQueryChange={setSearchQuery}
                filterType='trash'
            />
        </div>
    );
};

export default BinNotesPage;
