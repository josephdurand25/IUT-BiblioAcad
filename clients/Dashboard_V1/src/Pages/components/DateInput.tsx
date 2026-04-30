import React, { useState, useEffect } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DatePickerProps {
  name: string;
  contentStyle?:string
  error?: string,
  labelText: string; 
  onChange: (date: string) => void;
}

const DateInput: React.FC<DatePickerProps> = ({ name, labelText,contentStyle,error, onChange }) => {
  const [showDatepicker, setShowDatepicker] = useState(false);
  const [datepickerValue, setDatepickerValue] = useState('');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [noOfDays, setNoOfDays] = useState<number[]>([]);
  const [blankdays, setBlankdays] = useState<number[]>([]);

  useEffect(() => {
    getNoOfDays();
  }, [month, year]);

  const initDate = () => {
    const today = new Date();
    setMonth(today.getMonth());
    setYear(today.getFullYear());
    setDatepickerValue(today.toDateString());
  };

  const isToday = (date: number) => {
    const today = new Date();
    const d = new Date(year, month, date);
    return today.toDateString() === d.toDateString();
  };

  const getDateValue = (date: number) => {
    const selectedDate = new Date(Date.UTC(year, month, date));
    const formattedDate = selectedDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    setDatepickerValue(selectedDate.toDateString());
    onChange(formattedDate); 
    setShowDatepicker(false);
  };

  const getNoOfDays = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayOfWeek = new Date(year, month).getDay();
    const blankdaysArray = Array.from({ length: dayOfWeek }, (_, i) => i + 1);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    setBlankdays(blankdaysArray);
    setNoOfDays(daysArray);
  };

  const handleMonthChange = (offset: number) => {
    let newMonth = month + offset;
    let newYear = year;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setMonth(newMonth);
    setYear(newYear);
  };

  return (
    <div className={`${contentStyle}`}>
        <label htmlFor={name}  className={`block tracking-wide text-md font-bold ${error ? 'text-red-600': 'text-gray-800' } first-letter:uppercase`}>
        {labelText}
        </label>
        <div className="relative">
        <input
            type="hidden"
            name={name}
            value={datepickerValue}
        />
        <input
            type="text"
            readOnly
            id={name}
            value={datepickerValue}
            onClick={() => setShowDatepicker(!showDatepicker)}
            onKeyDown={(e) => e.key === 'Escape' && setShowDatepicker(false)}
            className="w-full pl-4 pr-10 py-3 leading-none rounded-lg shadow-sm focus:outline-none focus:shadow-outline text-slate-700 font-medium"
            placeholder="Select date"
        />
        <div className="absolute top-0 right-0 px-3 py-2">
            <svg
            className="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
            </svg>
        </div>

        {showDatepicker && (
            <div
            className="bg-white mt-12 rounded-lg shadow p-4 absolute top-0 left-0"
            style={{ width: '17rem' }}
            >
            <div className="flex justify-between items-center mb-2">
                <div>
                <span className="text-lg font-bold text-gray-800">
                    {MONTH_NAMES[month]}
                </span>
                <span className="ml-1 text-lg text-gray-600 font-normal">
                    {year}
                </span>
                </div>
                <div>
                <button
                    type="button"
                    className="transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-1 rounded-full"
                    disabled={month === 0}
                    onClick={() => handleMonthChange(-1)}
                >
                    <svg
                    className="h-6 w-6 text-gray-500 inline-flex"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                    />
                    </svg>
                </button>
                <button
                    type="button"
                    className="transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-1 rounded-full"
                    disabled={month === 11}
                    onClick={() => handleMonthChange(1)}
                >
                    <svg
                    className="h-6 w-6 text-gray-500 inline-flex"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                    />
                    </svg>
                </button>
                </div>
            </div>

            <div className="flex flex-wrap mb-3 -mx-1">
                {DAYS.map((day, index) => (
                <div key={index} style={{ width: '14.26%' }} className="px-1">
                    <div className="text-gray-800 font-medium text-center text-xs">
                    {day}
                    </div>
                </div>
                ))}
            </div>

            <div className="flex flex-wrap -mx-1">
                {blankdays.map((_, index) => (
                <div key={index} className="text-center border p-1 border-transparent text-sm" style={{ width: '14.28%' }}>
                </div>
                ))}
                {noOfDays.map((date, dateIndex) => (  
                <div key={dateIndex} style={{ width: '14.28%' }} className={`p-1 mb-1 rounded-full flex justify-center items-center text-gray-700 ${isToday(date) ? 'bg-blue-500 text-white' : ' hover:bg-slate-800 hover:text-slate-50' }`}>
                    <button className={`cursor-pointer text-center text-sm leading-loose transition ease-in-out duration-100 `} onClick={() => getDateValue(date)}>
                    {date}  
                    </button>
                </div>
                ))}
            </div>
            </div>
        )}
        </div>
    </div>
  );
};

export default DateInput;