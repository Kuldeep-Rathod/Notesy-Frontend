import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
    closeReminderMenu,
    setReminder,
} from '@/redux/reducer/noteInputReducer';
import { RootState } from '@/redux/store';
import { format } from 'date-fns';
import { Bell, CalendarIcon, Clock } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface ReminderPickerProps {
    onReminderSet: (date: Date | null) => void;
}

const quickOptions = [
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

export function ReminderPicker({ onReminderSet }: ReminderPickerProps) {
    const dispatch = useDispatch();
    const reminderString = useSelector((state: RootState) => state.noteInput.reminder);
    const reminder = reminderString ? new Date(reminderString) : null;
    const [time, setTime] = useState<string>(
        reminder ? format(reminder, 'HH:mm') : '12:00'
    );

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            const [hours, minutes] = time.split(':').map(Number);
            selectedDate.setHours(hours, minutes);
            dispatch(setReminder(selectedDate.toISOString()));
            onReminderSet(selectedDate);
            dispatch(closeReminderMenu());
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTime(e.target.value);
        if (reminder) {
            const [hours, minutes] = e.target.value.split(':').map(Number);
            const newDate = new Date(reminder);
            newDate.setHours(hours, minutes);
            dispatch(setReminder(newDate.toISOString()));
            onReminderSet(newDate);
        }
    };

    const handleRemoveReminder = () => {
        dispatch(setReminder(null));
        onReminderSet(null);
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
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant='outline'
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !reminder && 'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon className='mr-2 h-4 w-4' />
                                {reminder ? (
                                    format(reminder, 'PPP')
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className='w-auto p-0'
                            align='start'
                        >
                            <Calendar
                                mode='single'
                                selected={reminder || undefined}
                                onSelect={handleDateSelect}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
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
