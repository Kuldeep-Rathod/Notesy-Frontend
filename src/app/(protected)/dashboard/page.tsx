'use client';

import NoteInput from '@/components/notes/NoteInput';
import NotesContainer from '@/components/notes/NotesContainer';
import { useEffect, useRef, useState } from 'react';
import usePageVoiceCommands from '@/hooks/usePageVoiceCommands';
import { toast } from 'sonner';

function Page() {
    const [recentlyAdded, setRecentlyAdded] = useState(false);
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const noteInputRef = useRef<HTMLDivElement>(null);

    const handleSuccess = () => {
        setRecentlyAdded(true);
        // You might want to refresh your notes list here
    };

    // Configure dashboard-specific voice commands
    const { isActive } = usePageVoiceCommands(
        {
            '/dashboard': [
                {
                    command: ['create note', 'new note', 'add note'],
                    callback: () => {
                        if (noteInputRef.current) {
                            noteInputRef.current.click();
                            toast.success('Creating a new note');
                        }
                    },
                    isFuzzyMatch: true,
                    fuzzyMatchingThreshold: 0.7,
                },
                {
                    command: ['search *', 'find *', 'look for *'],
                    callback: (query: string) => {
                        setSearchQuery(query);
                        if (searchInputRef.current) {
                            searchInputRef.current.focus();
                            searchInputRef.current.value = query;
                        }
                        toast.info(`Searching for "${query}"`);
                    },
                    isFuzzyMatch: true,
                    fuzzyMatchingThreshold: 0.7,
                },
                {
                    command: ['clear search', 'reset search'],
                    callback: () => {
                        setSearchQuery('');
                        if (searchInputRef.current) {
                            searchInputRef.current.value = '';
                            searchInputRef.current.focus();
                        }
                        toast.info('Search cleared');
                    },
                },
                {
                    command: ['grade view', 'switch to grid', 'show grid'],
                    callback: () => {
                        setViewType('grid');
                        toast.info('Switched to grid view');
                    },
                },
                {
                    command: ['list view', 'switch to list', 'show list'],
                    callback: () => {
                        setViewType('list');
                        toast.info('Switched to list view');
                    },
                },
            ],
        },
        { debug: true, requireWakeWord: true }
    );

    // Forward viewType and searchQuery to NotesContainer
    const [forwardedState, setForwardedState] = useState({
        viewType,
        searchQuery,
    });

    useEffect(() => {
        setForwardedState({
            viewType,
            searchQuery,
        });
    }, [viewType, searchQuery]);

    // Set references to be accessed by voice commands
    const forwardRefs = (container: HTMLDivElement | null) => {
        if (container) {
            // Find the search input and set the ref
            const searchInput = container.querySelector('input[type="text"]');
            if (searchInput instanceof HTMLInputElement) {
                searchInputRef.current = searchInput;
            }
        }
    };

    return (
        <div>
            <div ref={noteInputRef}>
                <NoteInput onSuccess={handleSuccess} />
            </div>

            <div ref={forwardRefs}>
                <NotesContainer
                    initialViewType={viewType}
                    initialSearchQuery={searchQuery}
                    onViewTypeChange={setViewType}
                    onSearchQueryChange={setSearchQuery}
                />
            </div>

            {isActive && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '80px',
                        right: '20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        zIndex: 100,
                    }}
                >
                    Dashboard voice commands active
                </div>
            )}
        </div>
    );
}

export default Page;
