import { X, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

// Image Preview Modal Component
export const ImagePreviewModal = ({
    imageUrl,
    onClose,
}: {
    imageUrl: string;
    onClose: () => void;
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    return (
        <div
            className='image-preview-modal'
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '20px',
            }}
        >
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                }}
            >
                <X size={20} />
            </button>
            <Image
                src={imageUrl}
                key={imageUrl}
                alt='Preview'
                width={1200}
                height={800}
                priority
                quality={90}
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    width: '1200px',
                    height: 'auto',
                }}
                unoptimized
            />
        </div>
    );
};

// Image Preview Component
export const ImagePreview = ({
    images,
    onImageClick,
    onImageRemove,
}: {
    images: (File | string)[];
    onImageClick: (imageUrl: string) => void;
    onImageRemove: (index: number) => void;
}) => {
    const getImageUrl = (image: File | string): string => {
        if (typeof image === 'string') {
            return image;
        }
        return URL.createObjectURL(image);
    };

    if (images.length === 0) return null;

    return (
        <div
            className='note-input__images'
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '12px',
                marginBottom: '8px',
            }}
        >
            {images.map((image, index) => {
                const imageUrl = getImageUrl(image);
                return (
                    <div
                        key={index}
                        className='note-input__image-container'
                        style={{
                            position: 'relative',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #e0e0e0',
                        }}
                    >
                        <Image
                            src={imageUrl}
                            alt={`Preview ${index + 1}`}
                            width={80}
                            height={80}
                            onClick={() => onImageClick(imageUrl)}
                            style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease',
                                display: 'block',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        />

                        {/* Zoom overlay */}
                        <div
                            onClick={() => onImageClick(imageUrl)}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '0';
                            }}
                        >
                            <ZoomIn
                                size={20}
                                color='white'
                            />
                        </div>

                        {/* Remove button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onImageRemove(index);
                            }}
                            style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: 'rgba(0, 0, 0, 0.6)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                opacity: 0.8,
                                transition: 'opacity 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '0.8';
                            }}
                        >
                            <X size={12} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};
