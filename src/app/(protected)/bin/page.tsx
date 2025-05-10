'use client';

import { useState, useRef } from 'react';
import NoteCard from '@/components/notes/NoteCard';
import { NoteI } from '@/interfaces/notes';
import {
    useDeleteNoteMutation,
    useGetTrashedNotesQuery,
    useRestoreNoteMutation,
} from '@/redux/api/notesAPI';
import { Search, Grid, List, X } from 'lucide-react';
import '@/styles/components/notes/_noteCard.scss';

const BinNotesPage = () => {
    const {
        data: notes = [],
        isLoading,
        isError,
        refetch,
    } = useGetTrashedNotesQuery();

    const [restoreNote] = useRestoreNoteMutation();
    const [deleteNote] = useDeleteNoteMutation();

    const [searchQuery, setSearchQuery] = useState('');
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleRestore = async (id: string) => {
        try {
            await restoreNote(id).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to restore note:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNote(id).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        searchInputRef.current?.focus();
    };

    const filteredNotes = notes.filter((note: NoteI) =>
        searchQuery
            ? note.noteTitle
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
              note.noteBody?.toLowerCase().includes(searchQuery.toLowerCase())
            : true
    );

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
                        placeholder='Search bin notes...'
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
                    <p>Loading deleted notes...</p>
                </div>
            ) : isError ? (
                <div className='error-container'>
                    <p>Error loading deleted notes. Please try again later.</p>
                    <button
                        onClick={refetch}
                        className='retry-button'
                    >
                        Retry
                    </button>
                </div>
            ) : filteredNotes.length === 0 ? (
                <div className='empty-state'>
                    <p>
                        No deleted notes found
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
                        <span>Bin</span>
                        <span className='note-count'>
                            {filteredNotes.length}
                        </span>
                    </h3>
                    <div className={`notes-list ${viewType}`}>
                        {filteredNotes.map((note: NoteI) => (
                            <NoteCard
                                key={note._id}
                                note={note}
                                onRestore={() => handleRestore(note._id!)}
                                onDelete={() => handleDelete(note._id!)}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default BinNotesPage;
