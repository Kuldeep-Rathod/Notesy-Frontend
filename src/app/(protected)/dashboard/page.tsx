'use client';

import NoteInput from '@/components/notes/NoteInput';
import NotesContainer from '@/components/notes/NotesContainer';
import { getDashboardCommands } from '@/voice-assistant/commands/dashboardCommands';
import usePageVoiceCommands from '@/voice-assistant/hooks/usePageVoiceCommands';
import { useEffect, useRef, useState } from 'react';

function Page() {
    const [recentlyAdded, setRecentlyAdded] = useState(false);
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const noteInputRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSuccess = () => {
        setRecentlyAdded(true);
    };

    // Track modal state from NotesContainer
    const handleModalStateChange = (isOpen: boolean) => {
        setIsModalOpen(isOpen);
    };

    // Initialize voice commands
    const { isActive } = usePageVoiceCommands(
        {
            '/dashboard': getDashboardCommands({
                refs: { noteInputRef, searchInputRef },
                setters: { setSearchQuery, setViewType },
            }),
        },
        { debug: true, requireWakeWord: true }
    );

    // Forward the search input ref once the NotesContainer is mounted
    useEffect(() => {
        if (containerRef.current) {
            const searchInput =
                containerRef.current.querySelector('input.search-input');
            if (searchInput instanceof HTMLInputElement) {
                searchInputRef.current = searchInput;
            }
        }
    }, [containerRef.current]);

    // Function to forward the refs from the NotesContainer
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
            {/* Only render the main NoteInput when modal is not open */}
            {!isModalOpen && (
                <div ref={noteInputRef}>
                    <NoteInput onSuccess={handleSuccess} />
                </div>
            )}

            <div ref={forwardRefs}>
                <NotesContainer
                    initialViewType={viewType}
                    initialSearchQuery={searchQuery}
                    onViewTypeChange={setViewType}
                    onSearchQueryChange={setSearchQuery}
                    onModalStateChange={handleModalStateChange}
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
