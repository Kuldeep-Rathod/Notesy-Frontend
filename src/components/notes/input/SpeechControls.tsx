'use client';

import React from 'react';
import { Mic, MicOff, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface SpeechControlsProps {
    isListening: boolean;
    isPremiumUser: boolean | undefined;
    activeField: 'title' | 'body' | null;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    handleFieldFocus: (field: 'title' | 'body', fromMic?: boolean) => void;
}

const SpeechControls: React.FC<SpeechControlsProps> = ({
    isListening,
    isPremiumUser,
    activeField,
    startListening,
    stopListening,
    resetTranscript,
    handleFieldFocus,
}) => {
    return (
        <div
            className='note-input__speech-controls'
            style={styles.wrapper}
        >
            {/* Microphone Button */}
            <button
                className='note-input__mic-button'
                onClick={isListening ? stopListening : startListening}
                title={
                    !isPremiumUser
                        ? 'Premium feature only'
                        : isListening
                        ? 'Stop dictation'
                        : 'Start dictation'
                }
                disabled={!isPremiumUser}
                style={{
                    ...styles.button,
                    backgroundColor: isListening ? '#ff4c4c' : '#ffffff',
                    opacity: isPremiumUser ? 1 : 0.5,
                    cursor: isPremiumUser ? 'pointer' : 'not-allowed',
                }}
            >
                {isListening ? (
                    <MicOff
                        size={18}
                        color='#fff'
                    />
                ) : (
                    <Mic
                        size={18}
                        color='#444'
                    />
                )}
            </button>

            {/* Clear Button */}
            <button
                className='note-input__mic-button'
                onClick={() => {
                    if (!isPremiumUser) return;
                    resetTranscript();
                    if (activeField === 'title' || activeField === 'body') {
                        handleFieldFocus(activeField, true);
                    }
                }}
                title={
                    isPremiumUser
                        ? 'Clear transcription'
                        : 'Premium feature only'
                }
                disabled={!isPremiumUser}
                style={{
                    ...styles.button,
                    transition: 'background 0.2s ease',
                    opacity: isPremiumUser ? 1 : 0.5,
                    cursor: isPremiumUser ? 'pointer' : 'not-allowed',
                }}
            >
                <Trash2
                    size={18}
                    color='#444'
                />
            </button>

            {/* Listening Indicator */}
            {isListening && <div style={styles.indicator} />}

            {/* Upgrade to Premium Link */}
            {!isPremiumUser && (
                <Link
                    href='/upgrade'
                    style={styles.upgradeLink}
                >
                    Upgrade to Premium
                </Link>
            )}

            {/* Pulse animation */}
            <style>
                {`
                    @keyframes pulse {
                        0% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.5); opacity: 0.6; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `}
            </style>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    wrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginTop: '12px',
    },
    button: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        border: '1px solid #ddd',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    },
    indicator: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: '#ff4c4c',
        animation: 'pulse 1.5s infinite',
        marginLeft: '6px',
    },
    upgradeLink: {
        marginLeft: 'auto',
        fontSize: '14px',
        textDecoration: 'underline',
        color: '#007bff',
        whiteSpace: 'nowrap',
    },
};

export default SpeechControls;
