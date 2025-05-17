const Feedback = () => {
    return (
        <div className='bg-gray-50 py-16'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <h2 className='text-3xl font-extrabold text-gray-900 text-center'>
                    Loved by users worldwide
                </h2>
                <div className='mt-12 grid gap-8 md:grid-cols-3 lg:gap-x-12'>
                    <div className='bg-white p-6 rounded-lg shadow'>
                        <div className='flex items-center mb-4'>
                            <div className='h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center'>
                                <span className='text-xl font-bold text-indigo-600'>
                                    JD
                                </span>
                            </div>
                            <div className='ml-4'>
                                <h4 className='text-lg font-medium text-gray-900'>
                                    John Doe
                                </h4>
                                <p className='text-sm text-gray-500'>
                                    Marketing Manager
                                </p>
                            </div>
                        </div>
                        <p className='text-gray-600'>
                            &quot;VoiceNotes has completely transformed how I
                            capture ideas on the go. The voice control is
                            incredibly accurate and the organization features
                            save me hours each week.&quot;
                        </p>
                    </div>

                    <div className='bg-white p-6 rounded-lg shadow'>
                        <div className='flex items-center mb-4'>
                            <div className='h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center'>
                                <span className='text-xl font-bold text-indigo-600'>
                                    SM
                                </span>
                            </div>
                            <div className='ml-4'>
                                <h4 className='text-lg font-medium text-gray-900'>
                                    Sarah Miller
                                </h4>
                                <p className='text-sm text-gray-500'>
                                    Author & Blogger
                                </p>
                            </div>
                        </div>
                        <p className='text-gray-600'>
                            &quot;As a writer, I need to capture ideas quickly.
                            VoiceNotes Premium lets me speak my thoughts and
                            organizes them perfectly. The cloud sync between my
                            devices is seamless.&quot;
                        </p>
                    </div>

                    <div className='bg-white p-6 rounded-lg shadow'>
                        <div className='flex items-center mb-4'>
                            <div className='h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center'>
                                <span className='text-xl font-bold text-indigo-600'>
                                    RJ
                                </span>
                            </div>
                            <div className='ml-4'>
                                <h4 className='text-lg font-medium text-gray-900'>
                                    Robert Johnson
                                </h4>
                                <p className='text-sm text-gray-500'>
                                    Product Manager
                                </p>
                            </div>
                        </div>
                        <p className='text-gray-600'>
                            &quot;The custom voice commands feature is
                            game-changing. I&apos;ve set up shortcuts for my
                            most common notes and can now document meetings
                            without touching my keyboard.&quot;
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
