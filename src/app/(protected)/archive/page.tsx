'use client';

import { useState, useRef } from 'react';
import NoteCard from '@/components/notes/NoteCard';
import { NoteI } from '@/interfaces/notes';
import '@/styles/components/notes/_noteCard.scss';
import '@/styles/components/notes/_noteContainer.scss';
import { useGetArchivedNotesQuery } from '@/redux/api/notesAPI';
import { Search, Grid, List, X } from 'lucide-react';

const ArchivedNotesPage: React.FC = () => {
    const {
        data: notes = [],
        isLoading,
        isError,
        refetch,
    } = useGetArchivedNotesQuery();

    const [searchQuery, setSearchQuery] = useState('');
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filter archived notes based on search query
    const filteredNotes = notes.filter((note: NoteI) => {
        const matchesSearch = searchQuery
            ? note.noteTitle
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
              note.noteBody?.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        return matchesSearch;
    });

    // Clear search query
    const clearSearch = () => {
        setSearchQuery('');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    return (
        <div className='notes-container'>
            {/* Header */}
            <div className='notes-header'>
                <div className='search-container'>
                    <Search
                        size={18}
                        className='search-icon'
                    />
                    <input
                        ref={searchInputRef}
                        type='text'
                        placeholder='Search archived notes...'
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

            {/* Notes Section */}
            {isLoading ? (
                <div className='loading-container'>
                    <div className='loading-spinner'></div>
                    <p>Loading archived notes...</p>
                </div>
            ) : isError ? (
                <div className='error-container'>
                    <p>Error loading archived notes. Please try again later.</p>
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
                        No archived notes found
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
                        <span>Archived Notes</span>
                        <span className='note-count'>
                            {filteredNotes.length}
                        </span>
                    </h3>
                    <div className={`notes-list ${viewType}`}>
                        {filteredNotes.map((note: NoteI) => (
                            <NoteCard
                                key={note._id}
                                note={note}
                                onArchiveToggle={() => {}}
                                onTrash={() => {}}
                                onEdit={() => {}}
                                onChangeColor={() => {}}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ArchivedNotesPage;
