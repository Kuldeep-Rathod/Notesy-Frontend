'use client';

import VoiceDebugger from '@/voice-assistant/components/VoiceDebugger';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';

export default function VoiceTestPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render until we're on the client
    if (!mounted) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <CircularProgress />
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
                Voice Recognition Test Page
            </h1>

            <div
                style={{
                    marginBottom: '30px',
                    maxWidth: '800px',
                    margin: '0 auto',
                }}
            >
                <div
                    style={{
                        backgroundColor: '#e3f2fd',
                        padding: '15px',
                        borderRadius: '5px',
                        border: '1px solid #bbdefb',
                    }}
                >
                    <h2>Voice Recognition Troubleshooting</h2>
                    <p>
                        This page helps you test if your browser supports voice
                        recognition and if your microphone is working properly.
                    </p>
                    <p>For voice navigation to work:</p>
                    <ul>
                        <li>
                            Use Chrome, Edge, or another Chromium-based browser
                        </li>
                        <li>Allow microphone access when prompted</li>
                        <li>Make sure your microphone is working properly</li>
                        <li>
                            Make sure you&apos;re using HTTPS or localhost
                            (voice recognition requires a secure context)
                        </li>
                    </ul>
                </div>
            </div>

            <VoiceDebugger />

            <div
                style={{
                    marginTop: '30px',
                    padding: '15px',
                    backgroundColor: '#fff3e0',
                    borderRadius: '5px',
                    maxWidth: '600px',
                    margin: '0 auto',
                    border: '1px solid #ffe0b2',
                }}
            >
                <h3 style={{ marginTop: 0 }}>Common Issues:</h3>
                <ul style={{ marginBottom: 0 }}>
                    <li>
                        <strong>No transcript appears:</strong> Microphone may
                        not be working or permission is denied
                    </li>
                    <li>
                        <strong>Speech recognition not starting:</strong> Make
                        sure your browser supports the Web Speech API
                    </li>
                    <li>
                        <strong>Permission issues:</strong> Check your browser
                        settings and make sure microphone access is allowed
                    </li>
                    <li>
                        <strong>Wake words not detected:</strong> Try adjusting
                        the fuzzy matching threshold
                    </li>
                </ul>
            </div>
        </div>
    );
}
