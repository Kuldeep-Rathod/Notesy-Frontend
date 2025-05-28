'use client';

import { Theme } from '@excalidraw/excalidraw/element/types';
import type {
    ExcalidrawImperativeAPI,
    NormalizedZoomValue,
} from '@excalidraw/excalidraw/types';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

// Dynamically import Excalidraw
const Excalidraw = dynamic(
    () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
    {
        ssr: false,
        loading: () => null,
    }
);

interface BoardPreviewProps {
    elements: any[];
    appState: any;
    files: any;
}

export default function BoardPreview({
    elements,
    appState,
    files,
}: BoardPreviewProps) {
    const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Lazy load preview only when visible
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    // Prepare safe data and memoize
    const excalidrawData = useMemo(() => {
        return {
            elements: Array.isArray(elements) ? elements : [],
            appState: {
                viewBackgroundColor: appState?.viewBackgroundColor || '#ffffff',
                scrollX: 0,
                scrollY: 0,
                zoom: { value: 0.3 as NormalizedZoomValue },
                gridSize: undefined,
                viewModeEnabled: true,
                theme: 'light' as Theme,
                zenModeEnabled: false,
            },
            files: files || {},
        };
    }, [elements, appState, files]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        // SSR loading placeholder
        return (
            <div
                ref={ref}
                className='h-64 border rounded overflow-hidden flex items-center justify-center bg-gray-50'
            >
                <div className='text-center'>
                    <div className='w-8 h-8 border-2 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-2'></div>
                    <p className='text-sm text-gray-500'>Loading preview...</p>
                </div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className='h-64 border rounded overflow-hidden flex items-center justify-center bg-red-50'>
                <div className='text-center'>
                    <div className='w-12 h-12 bg-red-200 rounded-full flex items-center justify-center mb-2'>
                        <svg
                            className='w-6 h-6 text-red-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
                            />
                        </svg>
                    </div>
                    <p className='text-sm text-red-500'>Preview unavailable</p>
                </div>
            </div>
        );
    }

    if (excalidrawData.elements.length === 0) {
        return (
            <div
                ref={ref}
                className='h-64 border rounded overflow-hidden flex items-center justify-center bg-gray-50'
            >
                <div className='text-center'>
                    <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2'>
                        <svg
                            className='w-6 h-6 text-gray-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                            />
                        </svg>
                    </div>
                    <p className='text-sm text-gray-500'>Empty board</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className='h-64 border rounded overflow-hidden relative bg-white'
        >
            {inView ? (
                <Excalidraw
                    excalidrawAPI={(api: ExcalidrawImperativeAPI) => {
                        excalidrawRef.current = api;
                    }}
                    initialData={excalidrawData}
                    UIOptions={{
                        canvasActions: {
                            loadScene: false,
                            export: false,
                            saveAsImage: false,
                            clearCanvas: false,
                        },
                        tools: {
                            image: false,
                        },
                    }}
                    viewModeEnabled={true}
                />
            ) : (
                <div className='h-full w-full bg-gray-50' />
            )}

            {/* Prevent interactions */}
            <div className='absolute inset-0 pointer-events-none' />
        </div>
    );
}
