import { forwardRef } from 'react';
import classNames from 'classnames';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-600">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={classNames(
            'w-full px-3 py-2 border rounded-lg text-sm transition-colors',
            'focus:outline-none focus:ring-2',
            {
              'border-gray-300 focus:border-[#1A1A40] focus:ring-[#1A1A40]/20': !error,
              'border-red-300 focus:border-red-500 focus:ring-red-500/20': error,
            },
            className
          )}
          {...props}
        />
        {(error || helperText) && (
          <p
            className={classNames('text-sm', {
              'text-red-500': error,
              'text-gray-500': !error && helperText,
            })}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
