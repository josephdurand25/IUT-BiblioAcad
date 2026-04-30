
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { error?: string, labelText: string, inputStyle?: string, styleLabletext?: string, required?: boolean, pattern?: string, contentStyle?: string, auto_complete?:boolean }>  = ({placeholder, name, pattern, value, min, max, onChange, error, labelText, inputStyle, styleLabletext, required,contentStyle, disabled=false, type='text',auto_complete=false }) => {
  return (
    <div className={`${contentStyle}`}>
        <label className={`block tracking-wide ${error ? 'text-red-600': 'text-gray-800' }   text-sm font-bold first-letter:uppercase ${styleLabletext}`} htmlFor={name}>
          { labelText } {required && <span className="text-red-500">*</span>}
        </label>
        <input type={type} 
            placeholder={placeholder}
            name={name}
            id={name}
            pattern={pattern}
            value={value}
            min={min}
            max={max}
            onChange={onChange}
            className={`appearance-none block w-full bg-transparent text-gray-900 font-normal border border-gray-300 rounded-md shadow-sm leading-tight focus:outline-none focus:border-indigo-500 ${error && 'border-red-600'} ${inputStyle}`}
            required={required}
            disabled={disabled}  
            autoComplete={auto_complete ? "on" : "off"}
        />
        {error && <p className="text-red-600 text-xs font-semibold">{error}</p>}
    </div>
  );
};