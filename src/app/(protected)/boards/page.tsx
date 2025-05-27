import ExcalidrawClient from './ExcalidrawClient';

const Page = () => {
    return (
        <div
            style={{
                height: '80vh',
                width: '100%',
                minHeight: '500px',
            }}
        >
            <ExcalidrawClient />
        </div>
    );
};

export default Page;
