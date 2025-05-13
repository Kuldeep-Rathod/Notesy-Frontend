'use client';

import { useEffect, useState } from 'react';
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition';

const VoiceDebugger = () => {
    const [micPermission, setMicPermission] = useState<
        'granted' | 'denied' | 'pending'
    >('pending');
    const [transcriptHistory, setTranscriptHistory] = useState<string[]>([]);
    const [isListening, setIsListening] = useState(false);

    const { transcript, browserSupportsSpeechRecognition, resetTranscript } =
        useSpeechRecognition();

    // Log when transcript changes
    useEffect(() => {
        if (transcript && transcript.trim() !== '') {
            console.log('Current transcript:', transcript);
            setTranscriptHistory((prev) => [...prev, transcript].slice(-10));
        }
    }, [transcript]);

    // Check for microphone permission
    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(() => {
                    setMicPermission('granted');
                })
                .catch(() => {
                    setMicPermission('denied');
                });
        }
    }, []);

    // Handle start/stop listening
    const handleToggleListening = () => {
        if (isListening) {
            SpeechRecognition.stopListening();
            setIsListening(false);
        } else {
            SpeechRecognition.startListening({ continuous: true })
                .then(() => {
                    setIsListening(true);
                })
                .catch((err) => {
                    console.error('Error starting speech recognition:', err);
                });
        }
    };

    if (!browserSupportsSpeechRecognition) {
        return (
            <div className='voice-debugger'>
                <h2>Speech Recognition Not Supported</h2>
                <p>
                    Your browser doesn&apos;t support the Web Speech API needed
                    for voice control.
                </p>
                <p>Please try using Google Chrome or Microsoft Edge.</p>
            </div>
        );
    }

    return (
        <div
            className='voice-debugger'
            style={{
                padding: '20px',
                maxWidth: '600px',
                margin: '0 auto',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
        >
            <h2>Voice Recognition Debugger</h2>

            <div style={{ marginBottom: '20px' }}>
                <p>
                    <strong>Microphone Permission:</strong> {micPermission}
                </p>
                <p>
                    <strong>Browser Support:</strong>{' '}
                    {browserSupportsSpeechRecognition ? 'Yes' : 'No'}
                </p>
                <p>
                    <strong>Status:</strong>{' '}
                    {isListening ? 'Listening' : 'Not Listening'}
                </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={handleToggleListening}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: isListening ? '#f44336' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    {isListening ? 'Stop Listening' : 'Start Listening'}
                </button>

                <button
                    onClick={resetTranscript}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Clear Transcript
                </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Current Transcript:</h3>
                <div
                    style={{
                        padding: '15px',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        minHeight: '60px',
                        border: '1px solid #ddd',
                    }}
                >
                    {transcript || '(No speech detected)'}
                </div>
            </div>

            <div>
                <h3>Transcript History:</h3>
                <ul
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        padding: '10px',
                        listStyle: 'none',
                        maxHeight: '200px',
                        overflowY: 'auto',
                    }}
                >
                    {transcriptHistory.length > 0 ? (
                        transcriptHistory.map((item, index) => (
                            <li
                                key={index}
                                style={{
                                    padding: '5px',
                                    borderBottom:
                                        index < transcriptHistory.length - 1
                                            ? '1px solid #eee'
                                            : 'none',
                                }}
                            >
                                {item}
                            </li>
                        ))
                    ) : (
                        <li style={{ padding: '5px' }}>
                            No speech history yet
                        </li>
                    )}
                </ul>
            </div>

            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                <p>
                    <strong>Testing Instructions:</strong>
                    <br />
                    1. Click &quot;Start Listening&quot; and allow microphone
                    access if prompted
                    <br />
                    2. Say something clearly into your microphone
                    <br />
                    3. Your speech should appear in the &quot;Current
                    Transcript&quot; box
                    <br />
                    4. If nothing appears, check your browser console for errors
                </p>
            </div>
        </div>
    );
};

export default VoiceDebugger;
