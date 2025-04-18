'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;
}

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  dot = false,
}: BadgeProps) => {
  // Base classes
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400',
    secondary: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400',
    danger: 'bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400',
    warning: 'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  };
  
  // Dot colors
  const dotColors = {
    primary: 'bg-brand-500 dark:bg-brand-400',
    secondary: 'bg-gray-500 dark:bg-gray-400',
    success: 'bg-success-500 dark:bg-success-400',
    danger: 'bg-error-500 dark:bg-error-400',
    warning: 'bg-warning-500 dark:bg-warning-400',
    info: 'bg-blue-500 dark:bg-blue-400',
  };
  
  // Combine all classes
  const badgeClasses = twMerge(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    className
  );
  
  return (
    <span className={badgeClasses}>
      {dot && (
        <span
          className={twMerge(
            'mr-1.5 inline-block h-2 w-2 rounded-full',
            dotColors[variant]
          )}
        ></span>
      )}
      {children}
    </span>
  );
};

export default Badge;
