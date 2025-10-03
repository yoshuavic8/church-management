import React, { useState, useEffect } from 'react';
import { formatInputCurrency, parseCurrency } from '../../utils/currencyFormatter';

interface CurrencyInputProps {
  id?: string;
  name?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: number, formattedValue: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  min?: number;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  name,
  value = '',
  onChange,
  onValueChange,
  placeholder = '0',
  required = false,
  disabled = false,
  className = '',
  min = 1,
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');

  // Initialize display value
  useEffect(() => {
    if (value) {
      const numericValue = typeof value === 'string' ? parseCurrency(value) : value;
      const formatted = numericValue > 0 ? formatInputCurrency(numericValue.toString()) : '';
      setDisplayValue(formatted);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input
    if (!inputValue) {
      setDisplayValue('');
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: '',
          name: name || '',
        }
      };
      
      onChange?.(syntheticEvent);
      onValueChange?.(0, '');
      return;
    }

    // Format the input
    const formatted = formatInputCurrency(inputValue);
    setDisplayValue(formatted);
    
    // Get numeric value
    const numericValue = parseCurrency(inputValue);
    
    // Create synthetic event with numeric value for form handling
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: numericValue.toString(),
        name: name || '',
      }
    };
    
    onChange?.(syntheticEvent);
    onValueChange?.(numericValue, formatted);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Ensure minimum value if required
    if (required && min && displayValue) {
      const numericValue = parseCurrency(displayValue);
      if (numericValue < min) {
        const minFormatted = formatInputCurrency(min.toString());
        setDisplayValue(minFormatted);
        
        const syntheticEvent = {
          target: {
            ...e.target,
            value: min.toString(),
            name: name || '',
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange?.(syntheticEvent);
        onValueChange?.(min, minFormatted);
      }
    }
  };

  const baseClasses = `
    w-full px-3 py-2 border border-gray-300 rounded-md 
    focus:outline-none focus:ring-2 focus:ring-brand-500 
    dark:bg-gray-700 dark:border-gray-600 dark:text-white
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
  `.trim();

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
        Rp
      </span>
      <input
        id={id}
        name={name}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`${baseClasses} pl-10 ${className}`}
        inputMode="numeric"
        autoComplete="off"
      />
    </div>
  );
};

export default CurrencyInput;
