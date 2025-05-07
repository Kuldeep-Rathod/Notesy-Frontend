'use client';

import dynamic from 'next/dynamic';

// 👇 Dynamically import VoiceRouter only on the client
const VoiceRouter = dynamic(() => import('@/components/VoiceRouter'), {
    ssr: false,
});

const ClientOnlyWrapper = () => {
    return <VoiceRouter />;
};

export default ClientOnlyWrapper;
