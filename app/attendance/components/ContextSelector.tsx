import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import { EventCategory } from '../../types/ministry';
import { getCategoryContextLabel } from '../utils/attendanceUtils';

type ContextSelectorProps = {
  category: EventCategory;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

type ContextOption = {
  id: string;
  name: string;
};

export default function ContextSelector({
  category,
  value,
  onChange,
  disabled = false
}: ContextSelectorProps) {
  const [options, setOptions] = useState<ContextOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      const supabase = getSupabaseClient();

      let data: ContextOption[] = [];
      let error = null;

      switch (category) {
        case 'cell_group':
          const { data: cellGroups, error: cellGroupError } = await supabase
            .from('cell_groups')
            .select('id, name')
            .eq('status', 'active')
            .order('name');

          data = cellGroups || [];
          error = cellGroupError;
          break;

        case 'ministry':
          const { data: ministries, error: ministryError } = await supabase
            .from('ministries')
            .select('id, name')
            .eq('status', 'active')
            .order('name');

          data = ministries || [];
          error = ministryError;
          break;

        case 'class':
          try {

            // First, get sessions with levels
            const { data: classSessionsWithLevels, error: classSessionWithLevelsError } = await supabase
              .from('class_sessions')
              .select(`
                id,
                title,
                level_id,
                class_id,
                session_date,
                class_levels(class_id, name, class:class_id(name))
              `)
              .not('level_id', 'is', null)
              .order('session_date', { ascending: false });

            if (classSessionWithLevelsError) {
              error = classSessionWithLevelsError;
            }

            // Then, get sessions without levels (direct class sessions)
            const { data: classSessionsWithoutLevels, error: classSessionWithoutLevelsError } = await supabase
              .from('class_sessions')
              .select(`
                id,
                title,
                class_id,
                session_date,
                classes:class_id(name)
              `)
              .is('level_id', null)
              .order('session_date', { ascending: false });

            if (classSessionWithoutLevelsError) {
              error = classSessionWithoutLevelsError;
            }

            // Format the data to include class and level information
            let formattedSessions = [];

            // Format sessions with levels
            if (classSessionsWithLevels && classSessionsWithLevels.length > 0) {
              const withLevels = classSessionsWithLevels.map((session: any) => {
                const classLevels = Array.isArray(session.class_levels) ? session.class_levels[0] : session.class_levels;
                const className = classLevels?.class?.name || 'Class';
                const levelName = classLevels?.name || 'Level';
                return {
                  id: session.id,
                  name: `${className} - ${levelName} - ${session.title} (${new Date(session.session_date).toLocaleDateString()})`
                };
              });
              formattedSessions = [...formattedSessions, ...withLevels];
            }

            // Format sessions without levels
            if (classSessionsWithoutLevels && classSessionsWithoutLevels.length > 0) {
              const withoutLevels = classSessionsWithoutLevels.map((session: any) => {
                const classes = Array.isArray(session.classes) ? session.classes[0] : session.classes;
                const className = classes?.name || 'Class';
                return {
                  id: session.id,
                  name: `${className} - ${session.title} (${new Date(session.session_date).toLocaleDateString()})`
                };
              });
              formattedSessions = [...formattedSessions, ...withoutLevels];
            }

            data = formattedSessions;
            error = classSessionWithLevelsError || classSessionWithoutLevelsError;

          } catch (e) {
            data = [];
            error = e as any;
          }
          break;

        case 'prayer':
          // For prayer meetings, we could have predefined types or fetch from a prayer_types table
          // For now, we'll use hardcoded options
          data = [
            { id: 'prayer_tower', name: 'Prayer Tower' },
            { id: 'intercession', name: 'Intercession Prayer' },
            { id: 'fasting', name: 'Fasting Prayer' },
            { id: 'night_watch', name: 'Night Watch Prayer' },
            { id: 'other', name: 'Other Prayer Meeting' }
          ];
          break;

        case 'service':
          // For church services, we could have predefined types
          data = [
            { id: 'sunday_first', name: 'Sunday First Service' },
            { id: 'sunday_second', name: 'Sunday Second Service' },
            { id: 'midweek', name: 'Midweek Service' },
            { id: 'youth', name: 'Youth Service' },
            { id: 'children', name: 'Children Service' },
            { id: 'special', name: 'Special Service' }
          ];
          break;

        case 'other':
          // For other events, we could have predefined types
          data = [
            { id: 'fellowship', name: 'Fellowship' },
            { id: 'training', name: 'Training/Workshop' },
            { id: 'outreach', name: 'Outreach' },
            { id: 'social', name: 'Social Event' },
            { id: 'other', name: 'Other Event' }
          ];
          break;
      }

      if (error) {
      }
      setOptions(data);
      setLoading(false);

      // If there's only one option or the current value is not in the options,
      // automatically select the first option
      if (data.length > 0 && (data.length === 1 || !data.some(opt => opt.id === value))) {
        onChange(data[0].id);
      }
    };

    if (category) fetchOptions();
  }, [category]);

  if (!category) return null;


  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {getCategoryContextLabel(category)} *
      </label>
      {loading ? (
        <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
      ) : (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="input-field"
          disabled={disabled}
          required
        >
          <option value="">Select {getCategoryContextLabel(category)}</option>
          {options.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

// Helper function is now imported from attendanceUtils
