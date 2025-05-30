'use client';

import { useEffect, useState } from 'react';
import usePageVoiceCommands from './usePageVoiceCommands';

const VoiceTranscriptOverlay = ({ pageCommands }: { pageCommands: any }) => {
    const { transcript } = usePageVoiceCommands(pageCommands, {
        debug: false,
        requireWakeWord: true,
    });

    const [visibleTranscript, setVisibleTranscript] = useState('');
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (transcript) {
            setVisibleTranscript(transcript);
            setShow(true);

            const timeout = setTimeout(() => {
                setShow(false);
            }, 3000);

            return () => clearTimeout(timeout);
        }
    }, [transcript]);

    return show ? (
        <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fadeIn z-50'>
            {visibleTranscript}
        </div>
    ) : null;
};

export default VoiceTranscriptOverlay;
