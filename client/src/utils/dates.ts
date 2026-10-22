import { format, parseISO, differenceInCalendarDays, addDays, isToday, isTomorrow, isYesterday } from 'date-fns';

export const formatDate = (dateStr: string | Date | undefined, formatPattern = 'MMM d, yyyy'): string => {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '';
  return format(date, formatPattern);
};

export const formatRelativeDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEE, MMM d');
};

export const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  if (!hours || !minutes) return timeStr;
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes} ${ampm}`;
};

export const getDaysCountdown = (targetDateStr: string | undefined): { days: number; text: string; isPast: boolean } => {
  if (!targetDateStr) return { days: 0, text: 'No date planned', isPast: false };
  const target = parseISO(targetDateStr);
  const diff = differenceInCalendarDays(target, new Date());

  if (diff === 0) return { days: 0, text: 'Today', isPast: false };
  if (diff === 1) return { days: 1, text: 'Tomorrow', isPast: false };
  if (diff > 1) return { days: diff, text: `${diff} days left`, isPast: false };
  return { days: Math.abs(diff), text: `${Math.abs(diff)} days past`, isPast: true };
};
