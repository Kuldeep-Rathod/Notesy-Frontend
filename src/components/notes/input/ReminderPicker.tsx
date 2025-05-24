import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    closeReminderMenu,
    setReminder,
} from '@/redux/reducer/noteInputReducer';
import { RootState } from '@/redux/store';
import { format } from 'date-fns';
import { Bell, Clock } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const quickOptions = [
    {
        label: 'Later today',
        time: () => {
            const date = new Date();
            date.setHours(date.getHours() + 4);
            return date;
        },
    },
    {
        label: 'Tomorrow',
        time: () => {
            const date = new Date();
            date.setDate(date.getDate() + 1);
            date.setHours(9);
            return date;
        },
    },
    {
        label: 'Next week',
        time: () => {
            const date = new Date();
            date.setDate(date.getDate() + 7);
            date.setHours(9);
            return date;
        },
    },
];

export function ReminderPicker() {
    const dispatch = useDispatch();
    const reminderString = useSelector(
        (state: RootState) => state.noteInput.reminder
    );
    const reminder = reminderString ? new Date(reminderString) : null;
    const [time, setTime] = useState<string>(
        reminder ? format(reminder, 'HH:mm') : '12:00'
    );
    const [date, setDate] = useState<string>(
        reminder
            ? format(reminder, 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd')
    );

    const handleReminderSet = (date: Date | null) => {
        setReminder(date ? date.toISOString() : null);
    };

    const handleDateSelect = (selectedDate: Date) => {
        // Remove the time manipulation - the quick options already set their own times
        dispatch(setReminder(selectedDate.toISOString()));
        handleReminderSet(selectedDate);

        // Update the local state to reflect the new date/time
        setTime(format(selectedDate, 'HH:mm'));
        setDate(format(selectedDate, 'yyyy-MM-dd'));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setDate(newDate);
        const selectedDate = new Date(newDate);
        handleDateSelect(selectedDate);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value;
        setTime(newTime);
        if (reminder) {
            const [hours, minutes] = newTime.split(':').map(Number);
            const newDate = new Date(reminder);
            newDate.setHours(hours, minutes);
            dispatch(setReminder(newDate.toISOString()));
            handleReminderSet(newDate);
        }
    };

    const handleRemoveReminder = () => {
        dispatch(setReminder(null));
        handleReminderSet(null);
        dispatch(closeReminderMenu());
    };

    return (
        <div className='w-[300px] p-4 space-y-4'>
            <div className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                <Bell className='h-4 w-4' />
                <span>Set reminder</span>
            </div>

            <div className='space-y-3'>
                {quickOptions.map((option) => (
                    <Button
                        key={option.label}
                        variant='ghost'
                        className='w-full justify-start text-sm hover:bg-gray-100'
                        onClick={() => handleDateSelect(option.time())}
                    >
                        {option.label}
                    </Button>
                ))}
            </div>

            <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                    <span className='w-full border-t border-gray-200' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                    <span className='bg-white px-2 text-gray-500'>
                        Or pick date & time
                    </span>
                </div>
            </div>

            <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                    <Input
                        type='date'
                        value={date}
                        onChange={handleDateChange}
                        className='w-full'
                        min={format(new Date(), 'yyyy-MM-dd')}
                    />
                </div>

                <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-gray-500' />
                    <Input
                        type='time'
                        value={time}
                        onChange={handleTimeChange}
                        className='w-full'
                    />
                </div>
            </div>

            {reminder && (
                <div className='pt-2'>
                    <Button
                        variant='ghost'
                        className='w-full text-red-500 hover:text-red-600 hover:bg-red-50'
                        onClick={handleRemoveReminder}
                    >
                        Remove reminder
                    </Button>
                </div>
            )}
        </div>
    );
}
