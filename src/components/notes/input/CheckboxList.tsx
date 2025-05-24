'use client';

import { CheckboxI } from '@/interfaces/notes';
import {
    addChecklist,
    removeChecklist,
    selectNoteInput,
    toggleCboxCompletedList,
    updateChecklist,
} from '@/redux/reducer/noteInputReducer';
import { useDispatch, useSelector } from 'react-redux';

export function CheckboxList() {
    const dispatch = useDispatch();

    const { checklists, isCboxCompletedListCollapsed } =
        useSelector(selectNoteInput);

    const handleToggleCompletedList = () => {
        dispatch(toggleCboxCompletedList());
    };

    const handleCheckboxChange = (id: number | string) => {
        dispatch(
            updateChecklist({
                id,
                updates: {
                    checked: !checklists.find(
                        (cb) => cb.id === id || cb._id === id
                    )?.checked,
                },
            })
        );
    };

    const handleCheckboxRemove = (id: number | string) => {
        dispatch(removeChecklist(id));
    };

    const handleCheckboxUpdate = (id: number | string, value: string) => {
        if (value.trim()) {
            dispatch(updateChecklist({ id, updates: { text: value } }));
        }
    };

    const handleCheckboxKeyDown = (
        e: React.KeyboardEvent,
        id: number | string
    ) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const currentText = e.currentTarget.innerHTML;
            if (currentText.trim()) {
                const newId = Date.now();
                dispatch(addChecklist({ id: newId, text: '', checked: false }));
                setTimeout(() => {
                    const newCheckbox = document.querySelector(
                        `[data-checkbox-id="${newId}"]`
                    );
                    if (newCheckbox instanceof HTMLElement) {
                        newCheckbox.focus();
                    }
                }, 0);
            }
        } else if (e.key === 'Backspace' && e.currentTarget.innerHTML === '') {
            e.preventDefault();
            handleCheckboxRemove(id);
            if (typeof id === 'number') {
                const prevCheckbox = document.querySelector(
                    `[data-checkbox-id="${id - 1}"]`
                );
                if (prevCheckbox instanceof HTMLElement) {
                    prevCheckbox.focus();
                }
            }
        }
    };

    // Map _id to id if needed to handle both formats
    const normalizedChecklists = checklists.map((cb) => {
        if (cb.id === undefined && cb._id !== undefined) {
            return { ...cb, id: cb._id };
        }
        return cb;
    });

    // Filter out items with undefined ID and cast the result type
    const validChecklists = normalizedChecklists.filter(
        (cb) => cb.id !== undefined
    ) as (CheckboxI & { id: string | number })[];

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
                        onClick={() => handleCheckboxChange(cb.id)}
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
                                handleCheckboxUpdate(
                                    cb.id,
                                    e.currentTarget.innerHTML
                                )
                            }
                            onKeyDown={(e) => handleCheckboxKeyDown(e, cb.id)}
                            dangerouslySetInnerHTML={{ __html: cb.text }}
                        ></div>
                    </div>
                    <div
                        className={`note-input__checkbox-remove H`}
                        onClick={() => handleCheckboxRemove(cb.id)}
                    ></div>
                </div>
            ))}

            {completedCheckboxes.length > 0 && (
                <>
                    <div className='note-input__checkbox-divider'></div>
                    <div
                        className='note-input__checkbox-completed-header'
                        onClick={handleToggleCompletedList}
                    >
                        <div
                            className={`note-input__checkbox-toggle ${
                                !isCboxCompletedListCollapsed
                                    ? 'note-input__checkbox-toggle--expanded'
                                    : ''
                            }`}
                        ></div>
                        <div>
                            <span>
                                ({completedCheckboxes.length}) Completed{' '}
                                {completedCheckboxes.length === 1
                                    ? 'item'
                                    : 'items'}
                            </span>
                        </div>
                    </div>
                </>
            )}

            {!isCboxCompletedListCollapsed &&
                completedCheckboxes.map((cb) => (
                    <div
                        key={`checked-${cb.id}`}
                        className='note-input__checkbox-container'
                    >
                        <div className='note-input__checkbox-move-icon'></div>
                        <div
                            className={`note-input__checkbox-icon note-input__checkbox-icon--checked`}
                            onClick={() => handleCheckboxChange(cb.id)}
                        ></div>
                        <div className='note-input__checkbox-content'>
                            <div
                                className={`note-input__checkbox-item note-input__checkbox-item--completed`}
                                contentEditable
                                spellCheck
                                data-checkbox-id={cb.id}
                                onBlur={(e) =>
                                    handleCheckboxUpdate(
                                        cb.id,
                                        e.currentTarget.innerHTML
                                    )
                                }
                                onKeyDown={(e) =>
                                    handleCheckboxKeyDown(e, cb.id)
                                }
                                dangerouslySetInnerHTML={{ __html: cb.text }}
                            ></div>
                        </div>
                        <div
                            className={`note-input__checkbox-remove H`}
                            onClick={() => handleCheckboxRemove(cb.id)}
                        ></div>
                    </div>
                ))}
        </>
    );
}
