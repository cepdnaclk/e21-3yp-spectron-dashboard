/**
 * Simple date formatter utility
 * Replaces date-fns to avoid Metro bundler issues
 */

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Format date similar to date-fns format function
 * Supports: 'MMM dd, yyyy HH:mm'
 */
export const formatDate = (date: Date | string, formatStr: string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }

  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes();

  // Format: 'MMM dd, yyyy HH:mm'
  if (formatStr === 'MMM dd, yyyy HH:mm') {
    const monthName = MONTHS[month];
    const dayStr = day.toString().padStart(2, '0');
    const hoursStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${monthName} ${dayStr}, ${year} ${hoursStr}:${minutesStr}`;
  }

  // Fallback: return ISO string
  return d.toISOString();
};
