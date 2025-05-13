'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// 👇 Dynamically import VoiceRouter only on the client
const VoiceRouter = dynamic(() => import('@/components/VoiceRouter'), {
    ssr: false,
    loading: () => <VoiceAssistantLoading />,
});

function VoiceAssistantLoading() {
    return (
        <div
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                padding: '8px 12px',
                backgroundColor: '#f1f1f1',
                borderRadius: '50px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: '14px',
            }}
        >
            Loading voice assistant...
        </div>
    );
}

const ClientOnlyWrapper = () => {
    const [hasMounted, setHasMounted] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    useEffect(() => {
        setHasMounted(true);

        // Check if browser supports getUserMedia (microphone access)
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Request microphone permission
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(() => {
                    console.log('Microphone permission granted');
                    setHasPermission(true);
                })
                .catch((err) => {
                    console.error('Microphone permission denied:', err);
                    setHasPermission(false);
                });
        } else {
            console.warn('getUserMedia not supported in this browser');
            setHasPermission(false);
        }
    }, []);

    // Don't render anything until client-side
    if (!hasMounted) return null;

    // Show permission error if needed
    if (hasPermission === false) {
        return (
            <div
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#ffdddd',
                    color: '#d32f2f',
                    padding: '10px 15px',
                    borderRadius: '5px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    maxWidth: '300px',
                    zIndex: 1000,
                }}
            >
                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    Microphone Access Required
                </p>
                <p>
                    Please allow microphone access for voice navigation features
                    to work.
                </p>
            </div>
        );
    }

    return <VoiceRouter />;
};

export default ClientOnlyWrapper;
