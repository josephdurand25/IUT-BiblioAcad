import React from "react";

interface Option {
  id?: number;
  value?: string | number;
  label?: string;
}

interface InputMixtedProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  labelText: string;
  options?: Option[];
  indication?: string;
  bottomLeftLabel?: string;
  bottomRightLabel?: string;
  topRightLabel?: string;
  styleContainer?: string;
  as?: 'input' | 'select';
}

export const InputMixted: React.FC<InputMixtedProps> = ({
  name,
  value,
  onChange,
  error,
  labelText,
  options = [],
  indication = "Sélectionner une option",
  bottomLeftLabel,
  bottomRightLabel,
  topRightLabel,
  styleContainer = '',
  as = 'input',
  ...rest
}) => {
  if (as === 'select') {
    // Wrapper to adapt onChange to the correct type
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        // Cast to any to allow calling the original onChange
        (onChange as any)(e);
      }
    };

    return (
      <div className={`${styleContainer}`}>
        {topRightLabel && (
          <div className="label justify-end">
            <span className="label-text-alt">{topRightLabel}</span>
          </div>
        )}
        <div className="relative">
          <select
            className={`select select-filled w-full ${error && 'is-invalid border-red-400'} ${options.length === 0 ? 'bg-gray-100 text-slate-800' : ''}`}
            id={name}
            name={name}
            value={value}
            onChange={handleSelectChange}
            aria-invalid={!!error}
            {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            <option value="" disabled>{indication}</option>
            {options.map((option) => (
              <option key={option.id} value={option.value} className="font-normal text-gray-900 dark:text-black/85 first-letter:uppercase">
                {option?.label?.charAt(0).toUpperCase() + option.label?.slice(1)}
              </option>
            ))}
          </select>
          <span className="select-filled-focused"></span>
          <label className={`select-filled-label ${error ? 'text-red-600' : 'text-slate-800 font-bold text-md'}`} htmlFor={name}>{labelText}</label>
        </div>
        {(bottomLeftLabel || bottomRightLabel) && (
          <div className="label">
            <span className="label-text-alt">{bottomLeftLabel}</span>
            <span className="label-text-alt ml-auto">{bottomRightLabel}</span>
          </div>
        )}
        {error && <p className="text-red-600 text-xs font-semibold mt-1">{error}</p>}
      </div>
    );
  }
  // Input classique
  return (
    <div className={`w-full ${styleContainer}`}>
      <label className={`block tracking-wide ${error ? 'text-red-600': 'text-gray-800'} text-md font-bold first-letter:uppercase`} htmlFor={name}>
        {labelText} {rest.required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className={`appearance-none block w-full bg-transparent text-gray-900 font-normal border border-gray-400 rounded-md shadow-sm py-2 px-3 leading-tight focus:outline-none focus:border-blue-500 ${error && 'border-red-600'}`}
        aria-invalid={!!error}
        {...rest}
      />
      {error && <p className="text-red-600 text-xs font-semibold mt-1">{error}</p>}
    </div>
  );
};

export default InputMixted;
