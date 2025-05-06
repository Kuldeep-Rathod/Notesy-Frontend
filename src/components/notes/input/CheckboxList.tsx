'use client';

import { CheckboxI } from '@/interfaces/notes';

interface CheckboxListProps {
    checklists: CheckboxI[];
    isCompletedCollapsed: boolean;
    onToggleCollapse: () => void;
    onCheckboxChange: (id: number) => void;
    onCheckboxRemove: (id: number) => void;
    onCheckboxUpdate: (id: number, value: string) => void;
    onKeyDown: (e: React.KeyboardEvent, id: number) => void;
}

export function CheckboxList({
    checklists,
    isCompletedCollapsed,
    onToggleCollapse,
    onCheckboxChange,
    onCheckboxRemove,
    onCheckboxUpdate,
    onKeyDown,
}: CheckboxListProps) {
    const activeCheckboxes = checklists.filter((cb) => !cb.checked);
    const completedCheckboxes = checklists.filter((cb) => cb.checked);

    return (
        <>
            {activeCheckboxes.map((cb) => (
                <div
                    key={cb.id}
                    className='note-input__checkbox-container'
                >
                    <div className='note-input__checkbox-move-icon'></div>
                    <div
                        className={`note-input__checkbox-icon ${
                            cb.checked
                                ? 'note-input__checkbox-icon--checked'
                                : ''
                        }`}
                        onClick={() => onCheckboxChange(cb.id)}
                    ></div>
                    <div className='note-input__checkbox-content'>
                        <div
                            className={`note-input__checkbox-item ${
                                cb.checked
                                    ? 'note-input__checkbox-item--completed'
                                    : ''
                            }`}
                            contentEditable
                            spellCheck
                            onBlur={(e) =>
                                onCheckboxUpdate(
                                    cb.id,
                                    e.currentTarget.innerHTML
                                )
                            }
                            onKeyDown={(e) => onKeyDown(e, cb.id)}
                            dangerouslySetInnerHTML={{ __html: cb.text }}
                        ></div>
                    </div>
                    <div
                        className={`note-input__checkbox-remove H`}
                        onClick={() => onCheckboxRemove(cb.id)}
                    ></div>
                </div>
            ))}

            {completedCheckboxes.length > 0 && (
                <>
                    <div className='note-input__checkbox-divider'></div>
                    <div
                        className='note-input__checkbox-completed-header'
                        onClick={onToggleCollapse}
                    >
                        <div
                            className={`note-input__checkbox-toggle ${
                                !isCompletedCollapsed
                                    ? 'note-input__checkbox-toggle--expanded'
                                    : ''
                            }`}
                        ></div>
                        <div>
                            <span>
                                ({completedCheckboxes.length}) Completed item
                            </span>
                        </div>
                    </div>
                </>
            )}

            {!isCompletedCollapsed &&
                completedCheckboxes.map((cb) => (
                    <div
                        key={`checked-${cb.id}`}
                        className='note-input__checkbox-container'
                    >
                        <div className='note-input__checkbox-move-icon'></div>
                        <div
                            className={`note-input__checkbox-icon note-input__checkbox-icon--checked`}
                            onClick={() => onCheckboxChange(cb.id)}
                        ></div>
                        <div className='note-input__checkbox-content'>
                            <div
                                className={`note-input__checkbox-item note-input__checkbox-item--completed`}
                                contentEditable
                                spellCheck
                                onBlur={(e) =>
                                    onCheckboxUpdate(
                                        cb.id,
                                        e.currentTarget.innerHTML
                                    )
                                }
                                onKeyDown={(e) => onKeyDown(e, cb.id)}
                                dangerouslySetInnerHTML={{ __html: cb.text }}
                            ></div>
                        </div>
                        <div
                            className={`note-input__checkbox-remove H`}
                            onClick={() => onCheckboxRemove(cb.id)}
                        ></div>
                    </div>
                ))}
        </>
    );
}
