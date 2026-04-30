import React from "react";

interface CheckboxProps {
  name: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  className?: string;
  color?: string; // Optional color prop for future use
}

export const Checkbox: React.FC<CheckboxProps> = ({
  name,
  label,
  color = "blue", // Default color
  checked,
  onChange,
  required = false,
  className = "",
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        name={name}
        id={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required={required}
        className={`w-4 h-4 text-${color}-500 bg-slate-100 border-slate-300 rounded focus:ring-${color}-200  `}
      />
      <label htmlFor={name} className="tracking-wide ml-2 text-gray-900 text-md font-bold first-letter:uppercase">
        {label}
      </label>
    </div>
  );
};