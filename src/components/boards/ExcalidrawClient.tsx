'use client';

import dynamic from 'next/dynamic';

const ExcalidrawWrapper = dynamic(() => import('./excalidrawWrapper'), {
    ssr: false,
});

const ExcalidrawClient = () => {
    return (
        <div style={{ height: '100%', width: '100%' }}>
            <ExcalidrawWrapper />
        </div>
    );
};

export default ExcalidrawClient;
