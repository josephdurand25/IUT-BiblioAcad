import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  action?: boolean;
  requis?: boolean;
  labelText?: string;
  contenerStyle?: string;
  styleLabletext?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ action ,error,requis, labelText, styleLabletext, rows, name,contenerStyle, placeholder, onChange, ...props }) => {
  return (
    <div className={`${contenerStyle}`}>
      {action && (<div className="flex justify-between items-center py-2 px-3 border-b ">
        <div className="flex flex-wrap items-center divide-gray-200 sm:divide-x">
          <div className="flex items-center space-x-1 sm:pr-4">
            <button title='piece_jointe' type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 ">
              <i className="w-5 h-5 ri-attachment-2 font-bold -rotate-12"></i>
            </button>
            <button title='map' type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 ">
              <i className="w-5 h-5 ri-map-pin-fill font-bold"></i>
            </button>
            <button title='map' type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 ">
              <i className="w-5 h-5 ri-image-fill font-bold"></i>
            </button>
            <button title='map' type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 ">
              <i className="w-5 h-5 ri-code-s-slash-fill font-bold"></i>
            </button>
            <button title='map' type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 ">
              <i className="w-5 h-5 ri-emotion-fill font-bold"></i>
            </button>
          </div>
        </div>
        <button title='full-screen' type="button" data-tooltip-target="tooltip-fullscreen" className="p-2 text-gray-500 rounded cursor-pointer sm:ml-auto hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
          <i className="w-5 h-5 font-bold ri-fullscreen-fill"></i>
        </button>
      </div>)}
      <div className="py-2 px-4 bg-white rounded-b-lg ">
        {/* <label htmlFor={name} className="block tracking-wide text-gray-800 text-md font-bold first-letter:uppercase sr-only">{labelText}</label> */}
        <label className={`block tracking-wide ${error ? 'text-red-600': 'text-gray-800' }   text-md font-bold first-letter:uppercase ${styleLabletext}`} htmlFor={name}>
          { labelText } {requis && <span className="text-red-500">*</span>}
        </label>
        <textarea
          id={name}
          name={name}
          rows={rows}
          placeholder={placeholder}
          onChange={onChange}
          className={`block px-0 w-full text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400`}
          {...props}
        />
        {error && <p className="text-red-600 text-xs font-semibold">{error}</p>}
      </div>
    </div>
  );
};
