'use client';

import { bgColors, bgImages } from '@/interfaces/tooltip';

interface ColorMenuProps {
    onSelectColor: (color: string) => void;
    onSelectImage: (image: string) => void;
    onClose: () => void;
}

export function ColorMenu({
    onSelectColor,
    onSelectImage,
    onClose,
}: ColorMenuProps) {
    return (
        <div
            className='note-input__color-menu'
            data-tooltip='true'
            data-is-tooltip-open='true'
        >
            <div className='note-input__color-menu-row'>
                {Object.entries(bgColors).map(([key, value]) => (
                    <div
                        key={key}
                        data-bg-color={key}
                        style={{ backgroundColor: value }}
                        onClick={() => {
                            onSelectColor(value);
                            onClose();
                        }}
                        className={
                            value === ''
                                ? 'note-input__color-menu-option--transparent'
                                : 'note-input__color-menu-option'
                        }
                    ></div>
                ))}
            </div>
            <div className='note-input__color-menu-row'>
                {Object.entries(bgImages).map(([key, value]) => (
                    <div
                        key={key}
                        data-bg-image={key}
                        style={{ backgroundImage: value || 'none' }}
                        onClick={() => {
                            onSelectImage(value);
                            onClose();
                        }}
                        className={
                            value === ''
                                ? 'note-input__color-menu-option--transparent'
                                : 'note-input__color-menu-option'
                        }
                    ></div>
                ))}
            </div>
        </div>
    );
}
