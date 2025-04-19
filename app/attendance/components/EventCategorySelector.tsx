import React from 'react';
import { EventCategory } from '../../types/ministry';

type EventCategorySelectorProps = {
  value: EventCategory;
  onChange: (category: EventCategory) => void;
  disabled?: boolean;
};

export default function EventCategorySelector({
  value,
  onChange,
  disabled = false
}: EventCategorySelectorProps) {
  const categories = [
    { id: 'cell_group', label: 'Cell Group Meeting' },
    { id: 'prayer', label: 'Prayer Meeting' },
    { id: 'ministry', label: 'Ministry Meeting' },
    { id: 'service', label: 'Church Service' },
    { id: 'other', label: 'Other Event' }
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id as EventCategory)}
            className={`px-3 py-1 rounded-md ${
              value === category.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={disabled}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}
