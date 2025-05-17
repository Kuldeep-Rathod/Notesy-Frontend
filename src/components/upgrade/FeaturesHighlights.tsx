const FeaturesHighlights = () => {
    return (
        <div className='max-w-7xl mx-auto pb-16 px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <div className='bg-white rounded-lg shadow-md p-6 flex flex-col items-center'>
                    <div className='h-12 w-12 rounded-md flex items-center justify-center bg-indigo-100 text-indigo-600 mb-4'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                            className='h-6 w-6'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z'
                            />
                        </svg>
                    </div>
                    <h3 className='text-lg font-medium text-gray-900'>
                        Voice Control
                    </h3>
                    <p className='mt-2 text-sm text-gray-500 text-center'>
                        Create and manage notes using only your voice
                    </p>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6 flex flex-col items-center'>
                    <div className='h-12 w-12 rounded-md flex items-center justify-center bg-indigo-100 text-indigo-600 mb-4'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                            className='h-6 w-6'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z'
                            />
                        </svg>
                    </div>
                    <h3 className='text-lg font-medium text-gray-900'>
                        Cloud Sync
                    </h3>
                    <p className='mt-2 text-sm text-gray-500 text-center'>
                        Access your notes from any device, anywhere
                    </p>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6 flex flex-col items-center'>
                    <div className='h-12 w-12 rounded-md flex items-center justify-center bg-indigo-100 text-indigo-600 mb-4'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                            className='h-6 w-6'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
                            />
                        </svg>
                    </div>
                    <h3 className='text-lg font-medium text-gray-900'>
                        Custom Commands
                    </h3>
                    <p className='mt-2 text-sm text-gray-500 text-center'>
                        Create your own voice commands for faster note taking
                    </p>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6 flex flex-col items-center'>
                    <div className='h-12 w-12 rounded-md flex items-center justify-center bg-indigo-100 text-indigo-600 mb-4'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                            className='h-6 w-6'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                            />
                        </svg>
                    </div>
                    <h3 className='text-lg font-medium text-gray-900'>
                        Privacy First
                    </h3>
                    <p className='mt-2 text-sm text-gray-500 text-center'>
                        End-to-end encryption for your sensitive notes
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FeaturesHighlights;
