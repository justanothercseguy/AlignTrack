import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#8885A5] uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-[#F8F7FF] border border-[#E9E3FF] rounded-xl px-4 py-2.5 text-sm text-[#292747] placeholder-[#8885A5]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9B8AFB] focus:border-transparent transition-all duration-200 disabled:opacity-50 ${
            error ? 'border-[#FFB3AB] focus:ring-[#FFB3AB]' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[#BF2600]">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-[#8885A5]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
