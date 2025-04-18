'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
  bordered?: boolean;
}

const Card = ({
  children,
  className,
  title,
  subtitle,
  icon,
  footer,
  noPadding = false,
  bordered = true,
}: CardProps) => {
  return (
    <div
      className={twMerge(
        'rounded-lg bg-white shadow-theme-sm dark:bg-gray-800',
        bordered && 'border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {(title || subtitle || icon) && (
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
      
      {footer && (
        <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
