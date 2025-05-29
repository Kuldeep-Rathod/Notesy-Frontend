import { Cloudy, Mic, Shield, Users } from 'lucide-react';

const FeaturesHighlights = () => {
    return (
        <div className='max-w-7xl mx-auto pb-16 px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <div className='bg-white rounded-lg shadow-md p-6 flex flex-col items-center'>
                    <div className='h-12 w-12 rounded-md flex items-center justify-center bg-indigo-100 text-indigo-600 mb-4'>
                        <Mic className='w-6 h-6' />
                    </div>
                    <h3 className='text-lg font-medium text-gray-900'>
                        Voice Control
                    </h3>
                    <p className='mt-2 text-sm text-gray-500 text-center'>
                        Create, edit, and manage notes entirely with your voice
                    </p>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6 flex flex-col items-center'>
                    <div className='h-12 w-12 rounded-md flex items-center justify-center bg-indigo-100 text-indigo-600 mb-4'>
                        <Cloudy className='w-6 h-6' />
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
                        <Users className='w-6 h-6' />
                    </div>
                    <h3 className='text-lg font-medium text-gray-900'>
                        Collaboration
                    </h3>
                    <p className='mt-2 text-sm text-gray-500 text-center'>
                        Share and collaborate on notes with voice invitations
                    </p>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6 flex flex-col items-center'>
                    <div className='h-12 w-12 rounded-md flex items-center justify-center bg-indigo-100 text-indigo-600 mb-4'>
                        <Shield className='w-6 h-6' />
                    </div>
                    <h3 className='text-lg font-medium text-gray-900'>
                        Secure & Private
                    </h3>
                    <p className='mt-2 text-sm text-gray-500 text-center'>
                        Your notes are encrypted and protected
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FeaturesHighlights;
