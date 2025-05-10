'use client';

import { useParams } from 'next/navigation';
import NoteCard from '@/components/notes/NoteCard';
import { NoteI } from '@/interfaces/notes';
import { useGetUserNotesQuery } from '@/redux/api/notesAPI';
import { Grid, List, Search, X } from 'lucide-react';
import { useRef, useState } from 'react';

const LabelNotesPage: React.FC = () => {
    const { slug } = useParams();
    const {
        data: notes = [],
        isLoading,
        isError,
        refetch,
    } = useGetUserNotesQuery() as ReturnType<typeof useGetUserNotesQuery>;
    const [searchQuery, setSearchQuery] = useState('');
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filter notes that contain this label slug
    const filteredNotes = notes.filter((note: NoteI) =>
        note.labels?.some((label) => label === slug)
    );

    if (isLoading)
        return <div className='loading'>Loading notes for {slug}...</div>;
    if (isError) return <div className='error'>Error loading notes</div>;

    // Clear search query
    const clearSearch = () => {
        setSearchQuery('');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    return (
        <div className='notes-container'>
            {/* Header with search and view toggle */}
            <div className='notes-header'>
                <div className='search-container'>
                    <Search
                        size={18}
                        className='search-icon'
                    />
                    <input
                        ref={searchInputRef}
                        type='text'
                        placeholder={`Search ${slug} notes...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='search-input'
                    />
                    {searchQuery && (
                        <button
                            className='clear-search'
                            onClick={clearSearch}
                            aria-label='Clear search'
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                <div className='view-options'>
                    <button
                        className={`view-toggle ${
                            viewType === 'grid' ? 'active' : ''
                        }`}
                        onClick={() => setViewType('grid')}
                        aria-label='Grid view'
                    >
                        <Grid size={20} />
                    </button>
                    <button
                        className={`view-toggle ${
                            viewType === 'list' ? 'active' : ''
                        }`}
                        onClick={() => setViewType('list')}
                        aria-label='List view'
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            {/* Notes section */}
            {isLoading ? (
                <div className='loading-container'>
                    <div className='loading-spinner'></div>
                    <p>Loading {slug} notes...</p>
                </div>
            ) : isError ? (
                <div className='error-container'>
                    <p>Error loading {slug} notes. Please try again later.</p>
                    <button
                        onClick={() => refetch()}
                        className='retry-button'
                    >
                        Retry
                    </button>
                </div>
            ) : filteredNotes.length === 0 ? (
                <div className='empty-state'>
                    <p>
                        No {slug} notes found
                        {searchQuery ? ' matching your search' : ''}
                    </p>
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className='clear-search-button'
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            ) : (
                <section className='notes-section'>
                    <h3 className='section-title'>
                        <span>{slug} Notes</span>
                        <span className='note-count'>
                            {filteredNotes.length}
                        </span>
                    </h3>
                    <div className={`notes-list ${viewType}`}>
                        {filteredNotes.map((note: NoteI) => (
                            <NoteCard
                                key={note._id}
                                note={note}
                                onArchiveToggle={() => {}} // Add handler if needed
                                onTrash={() => {}} // Add handler if needed
                                onEdit={() => {}} // Add handler if needed
                                onChangeColor={() => {}} // Add handler if needed
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default LabelNotesPage;
