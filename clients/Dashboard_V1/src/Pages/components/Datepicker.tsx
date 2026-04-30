import React from 'react';
import Flatpickr from 'react-flatpickr';

interface DatepickerProps {
  align?: string;
  onChange: (date: string) => void; // Type de la fonction onChange
}

const Datepicker: React.FC<DatepickerProps> = ({ align, onChange }) => {
  const options = {
    mode: 'single',
    static: true,
    dateFormat: 'M j, Y',
    onChange: (selectedDates: Date[], dateStr: string) => {
      if (onChange) onChange(dateStr); // Appelle la fonction du parent avec la date
    },
  };

  return (
    <div className="relative">
      <Flatpickr
        className="form-input pl-9 dark:bg-gray-800 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 font-medium w-[15.5rem]"
        options={options}
      />
      <div className="absolute inset-0 right-auto flex items-center pointer-events-none">
        <svg
          className="fill-current text-gray-400 dark:text-gray-500 ml-3"
          width="16"
          height="16"
          viewBox="0 0 16 16"
        >
          <path d="M5 4a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z" />
          <path d="M4 0a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4H4ZM2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z" />
        </svg>
      </div>
    </div>
  );
};


export default Datepicker;
