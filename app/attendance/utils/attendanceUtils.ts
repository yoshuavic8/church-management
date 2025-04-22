import { EventCategory, ExtendedAttendanceMeeting } from '../../types/ministry';

/**
 * Get the context name based on the meeting data
 * @param meeting Meeting data
 * @returns Context name
 */
export function getContextName(meeting: any): string {
  if (!meeting) return '';
  
  if (meeting.event_category === 'cell_group' && meeting.cell_group) {
    return meeting.cell_group.name || 'Cell Group';
  } else if (meeting.event_category === 'ministry' && meeting.ministry) {
    return meeting.ministry?.name || 'Ministry';
  } else if (meeting.event_category === 'class') {
    // For class sessions, use the topic as the name
    return meeting.topic || 'Class Session';
  } else if (meeting.event_category === 'prayer') {
    return 'Prayer Meeting';
  } else if (meeting.event_category === 'service') {
    return meeting.topic || 'Church Service';
  } else {
    // Default fallback
    return meeting.event_category?.replace('_', ' ') || 'Meeting';
  }
}

/**
 * Get the meeting type label
 * @param type Meeting type
 * @returns Meeting type label
 */
export function getMeetingTypeLabel(type: string): string {
  switch (type) {
    case 'regular':
      return 'Regular Meeting';
    case 'special':
      return 'Special Meeting';
    case 'outreach':
      return 'Outreach';
    case 'prayer':
      return 'Prayer Meeting';
    case 'class':
      return 'Class Session';
    case 'service':
      return 'Church Service';
    case 'training':
      return 'Training';
    case 'fellowship':
      return 'Fellowship';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  }
}

/**
 * Get the category context label
 * @param category Event category
 * @returns Category context label
 */
export function getCategoryContextLabel(category: EventCategory): string {
  switch (category) {
    case 'cell_group': return 'Cell Group';
    case 'ministry': return 'Ministry';
    case 'prayer': return 'Prayer Type';
    case 'service': return 'Service Type';
    case 'class': return 'Class Session';
    default: return 'Event Type';
  }
}

/**
 * Get the status badge class
 * @param status Attendance status
 * @returns CSS class for the status badge
 */
export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'present':
      return 'bg-green-100 text-green-800';
    case 'absent':
      return 'bg-red-100 text-red-800';
    case 'late':
      return 'bg-yellow-100 text-yellow-800';
    case 'excused':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Format a date string
 * @param dateString Date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date string to a short format
 * @param dateString Date string
 * @returns Formatted date string
 */
export function formatShortDate(dateString: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
}

/**
 * Calculate attendance statistics
 * @param participants Attendance participants
 * @param visitors Attendance visitors
 * @returns Attendance statistics
 */
export function calculateAttendanceStats(participants: any[], visitors: any[] = []) {
  const total = participants?.length || 0;
  const present = participants?.filter(p => p.status === 'present').length || 0;
  const absent = participants?.filter(p => p.status === 'absent').length || 0;
  const late = participants?.filter(p => p.status === 'late').length || 0;
  const excused = participants?.filter(p => p.status === 'excused').length || 0;
  const visitorCount = visitors?.length || 0;
  
  return {
    total,
    present,
    absent,
    late,
    excused,
    visitors: visitorCount,
    presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0,
    absentPercentage: total > 0 ? Math.round((absent / total) * 100) : 0,
    latePercentage: total > 0 ? Math.round((late / total) * 100) : 0,
    excusedPercentage: total > 0 ? Math.round((excused / total) * 100) : 0,
  };
}

/**
 * Export attendance data to CSV
 * @param records Attendance records
 * @param filename Filename for the CSV file
 */
export function exportToCSV(records: any[], filename: string = 'attendance_records') {
  if (!records.length) return;
  
  // Prepare CSV content
  const headers = ['Date', 'Event Type', 'Context', 'Topic', 'Present', 'Absent', 'Late', 'Visitors'];
  const rows = records.map(record => [
    new Date(record.meeting_date).toLocaleDateString(),
    getMeetingTypeLabel(record.meeting_type),
    getContextName(record),
    record.topic || '',
    record.present_count || 0,
    record.absent_count || 0,
    record.late_count || 0,
    record.visitor_count || 0
  ]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get date range for filtering
 * @param range Date range (week, month, quarter, year, all)
 * @returns Start and end dates
 */
export function getDateRange(range: 'week' | 'month' | 'quarter' | 'year' | 'all'): { startDate: Date, endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (range) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case 'all':
      startDate.setFullYear(2000); // Far in the past
      break;
  }
  
  return { startDate, endDate };
}
