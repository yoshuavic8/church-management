'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface TableProps {
  children: React.ReactNode;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
}

const Table = ({
  children,
  className,
  striped = true,
  hoverable = true,
  bordered = true,
}: TableProps) => {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={twMerge(
          'w-full whitespace-nowrap',
          bordered && 'border-collapse border border-gray-200 dark:border-gray-700',
          className
        )}
      >
        {children}
      </table>
    </div>
  );
};

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

const TableHead = ({ children, className }: TableHeadProps) => {
  return (
    <thead className={twMerge('bg-gray-50 dark:bg-gray-800', className)}>
      {children}
    </thead>
  );
};

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
}

const TableBody = ({
  children,
  className,
  striped = true,
  hoverable = true,
}: TableBodyProps) => {
  return (
    <tbody
      className={twMerge(
        'divide-y divide-gray-200 dark:divide-gray-700',
        className
      )}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            className: twMerge(
              child.props.className,
              striped && index % 2 === 1 && 'bg-gray-50 dark:bg-gray-800 dark:bg-opacity-50',
              hoverable && 'hover:bg-gray-100 dark:hover:bg-gray-800'
            ),
          });
        }
        return child;
      })}
    </tbody>
  );
};

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

const TableRow = ({ children, className }: TableRowProps) => {
  return (
    <tr className={className}>
      {children}
    </tr>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  header?: boolean;
}

const TableCell = ({ children, className, header = false }: TableCellProps) => {
  const Component = header ? 'th' : 'td';

  return (
    <Component
      className={twMerge(
        'px-4 py-3 text-sm',
        header ? 'font-medium text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400',
        'border-b border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {children}
    </Component>
  );
};

export { Table, TableHead, TableBody, TableRow, TableCell };
