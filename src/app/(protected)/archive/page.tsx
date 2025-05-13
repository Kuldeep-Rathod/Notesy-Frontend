'use client';

import NotesContainer from '@/components/notes/NotesContainer';
import { useRef, useState } from 'react';
import { getArchiveCommands } from '@/voice-assistant/commands/archiveCommands';
import usePageVoiceCommands from '@/voice-assistant/hooks/usePageVoiceCommands';

function ArchivedNotesPage() {
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize voice commands
    const { isActive } = usePageVoiceCommands(
        {
            '/archive': getArchiveCommands({
                refs: { searchInputRef },
                setters: { setSearchQuery, setViewType },
            }),
        },
        { debug: true, requireWakeWord: true }
    );

    // Forward the search input ref once the NotesContainer is mounted
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
        <div>
            <div ref={forwardRefs}>
                <NotesContainer
                    initialViewType={viewType}
                    initialSearchQuery={searchQuery}
                    filterType='archive'
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
                    Archive voice commands active
                </div>
            )}
        </div>
    );
}

export default ArchivedNotesPage;
