import React from "react";

interface Option {
  id: number;  // Ajout d'un identifiant unique
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  requis?: boolean;
  options?: Option[];
  labelText:string;
  indication?:string;
  styleSelect?: string;
  styleSelectLabelText?: string;
  styleContainer?: string;
}
export const Select: React.FC<SelectProps>= ({ name, value, onChange, options = [], error, labelText, requis, styleContainer ,indication="Select an option", styleSelect, styleSelectLabelText }) => {
  return (
    <div className={`${styleContainer}`}>
      <label className={`block tracking-wide ${error ? 'text-red-600': 'text-gray-800' } text-sm font-bold first-letter:uppercase ${styleSelectLabelText}`} htmlFor={name}>
        { labelText } {requis && <span className="text-red-500">*</span>}
      </label>
      {/* {options.length === 0 && <p className="text-yellow-500 text-xs">No options available.</p>} */}
      {options.length === 0 ? <div className="appearance-none block w-full bg-transparent border border-gray-400 rounded-lg py-2 px-3 leading-tight text-red-500 focus:outline-none focus:border-indigo-500 ">No options available.</div>
      : 
      <select
        title={name}
        name={name}
        aria-readonly={options.length === 0}
        value={value}
        onChange={(e) => onChange && onChange(e)}
        className={`appearance-none block w-full bg-transparent border ${error ? 'border-red-400' : 'border-gray-400'} rounded-lg py-2 px-3 leading-tight focus:outline-none focus:border-indigo-500 ${styleSelect}`}>
        {/* je doit chercher comment on change la couleur de font de la liste d'option lorsque le theme est dark */}
        <option value="" disabled className={`${ error ? 'text-red-700' : 'text-gray-900'} dark:text-gray-400 font-thin first-letter:uppercase`} selected>{indication}</option>
        {options.map((option) => (
          <option key={option.id} value={option.value} className="font-normal text-gray-900 dark:text-black/85 first-letter:uppercase">
            {option.label.charAt(0).toUpperCase() + option.label.slice(1)}
          </option>
        ))}
      </select>
      }
      {error && <p className="text-red-600 text-xs font-semibold">{error}</p>}
    </div>
  );
};
