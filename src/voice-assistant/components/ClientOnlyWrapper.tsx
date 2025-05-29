'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const VoiceRouter = dynamic(() => import('@/voice-assistant/VoiceRouter'), {
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
    const [showMicAlert, setShowMicAlert] = useState(false);

    useEffect(() => {
        setHasMounted(true);

        const dismissed = sessionStorage.getItem('micAlertDismissed');

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(() => {
                    console.log('Microphone permission granted');
                    setHasPermission(true);
                })
                .catch((err) => {
                    console.warn('Microphone permission denied:', err);
                    setHasPermission(false);

                    toast.error('Microphone access denied', {
                        description:
                            'Please allow microphone access for voice features to work.',
                        duration: Infinity,
                        action: {
                            label: 'X',
                            onClick: () => {
                                setShowMicAlert(false);
                            },
                        },
                    });

                    if (!dismissed && !showMicAlert) {
                        setShowMicAlert(true);
                    }
                });
        } else {
            console.warn('getUserMedia not supported in this browser');
            setHasPermission(false);

            if (!dismissed && !showMicAlert) {
                setShowMicAlert(true);
            }
        }
    }, []);

    if (!hasMounted) return null;

    return (
        <>
            {showMicAlert && (
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
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div>
                            <p
                                style={{
                                    fontWeight: 'bold',
                                    marginBottom: '5px',
                                }}
                            >
                                Microphone Access Required
                            </p>
                            <p style={{ fontSize: '0.9rem' }}>
                                Please allow microphone access for voice
                                navigation features to work.
                            </p>
                        </div>
                        <button
                            // onClick={handleCloseAlert}
                            style={{
                                marginLeft: '10px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                color: '#d32f2f',
                            }}
                            aria-label='Close'
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}

            {hasPermission !== false && <VoiceRouter />}
        </>
    );
};

export default ClientOnlyWrapper;
