'use client';

import NoteInput from '@/components/notes/NoteInput';
import NotesContainer from '@/components/notes/NotesContainer';
import { getDashboardCommands } from '@/voice-assistant/commands/dashboardCommands';
import usePageVoiceCommands from '@/voice-assistant/hooks/usePageVoiceCommands';
import { useRef, useState } from 'react';

function Page() {
    const [recentlyAdded, setRecentlyAdded] = useState(false);
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const noteInputRef = useRef<HTMLDivElement>(null);

    const handleSuccess = () => {
        setRecentlyAdded(true);
    };

    const { isActive } = usePageVoiceCommands(
        {
            '/dashboard': getDashboardCommands({
                refs: { noteInputRef, searchInputRef },
                setters: { setSearchQuery, setViewType },
            }),
        },
        { debug: true, requireWakeWord: true }
    );

    const forwardRefs = (container: HTMLDivElement | null) => {
        if (container) {
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
