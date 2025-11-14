import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  required = false,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[#1C1C1C] text-[16px] font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`py-3 border border-fade rounded-xl w-full px-4 bg-[#FFFFFF] placeholder:text-[#1C1C1C33] text-[15px] focus:outline-none focus:ring-2 focus:ring-button focus:border-transparent transition-all ${
          error ? 'border-red-500' : ''
        } ${className}`}
      />
      {error && (
        <p className="text-red-500 text-[14px] font-normal">{error}</p>
      )}
    </div>
  );
};

export default Input;

