'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500 focus:ring-opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600 dark:focus:ring-brand-500 dark:focus:ring-opacity-50',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500 focus:ring-opacity-50 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-500 dark:focus:ring-opacity-50',
    success: 'bg-success-500 text-white hover:bg-success-600 focus:ring-success-500 focus:ring-opacity-50 dark:bg-success-500 dark:hover:bg-success-600 dark:focus:ring-success-500 dark:focus:ring-opacity-50',
    danger: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500 focus:ring-opacity-50 dark:bg-error-500 dark:hover:bg-error-600 dark:focus:ring-error-500 dark:focus:ring-opacity-50',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500 focus:ring-opacity-50 dark:bg-warning-500 dark:hover:bg-warning-600 dark:focus:ring-warning-500 dark:focus:ring-opacity-50',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 focus:ring-opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-gray-500 dark:focus:ring-opacity-50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 focus:ring-opacity-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-gray-500 dark:focus:ring-opacity-50',
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Disabled classes
  const disabledClasses = (disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : '';

  // Combine all classes
  const buttonClasses = twMerge(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    widthClasses,
    disabledClasses,
    className
  );

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}

      {!isLoading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}

      {children}

      {!isLoading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default Button;
