'use client';

import { CheckboxI } from '@/interfaces/notes';

interface CheckboxListProps {
    checklists: CheckboxI[];
    isCompletedCollapsed: boolean;
    onToggleCollapse: () => void;
    onCheckboxChange: (id: number | string) => void;
    onCheckboxRemove: (id: number | string) => void;
    onCheckboxUpdate: (id: number | string, value: string) => void;
    onKeyDown: (e: React.KeyboardEvent, id: number | string) => void;
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
    // Map _id to id if needed to handle both formats
    const normalizedChecklists = checklists.map(cb => {
        if (cb.id === undefined && cb._id !== undefined) {
            return { ...cb, id: cb._id };
        }
        return cb;
    });

    // Filter out items with undefined ID and cast the result type
    const validChecklists = normalizedChecklists.filter(cb => cb.id !== undefined) as (CheckboxI & { id: string | number })[];
    
    const activeCheckboxes = validChecklists.filter((cb) => !cb.checked);
    const completedCheckboxes = validChecklists.filter((cb) => cb.checked);

    return (
        <>
            {activeCheckboxes.map((cb) => (
                <div
                    key={`active-${cb.id}`}
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
                            data-checkbox-id={cb.id}
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
                                ({completedCheckboxes.length}) Completed {completedCheckboxes.length === 1 ? 'item' : 'items'}
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
                                data-checkbox-id={cb.id}
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
