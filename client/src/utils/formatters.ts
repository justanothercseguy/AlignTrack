export const formatHoursMinutes = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

export const formatHoursDecimal = (hours: number): string => {
  return `${hours.toFixed(1)}h`;
};

export const getCategoryLabel = (category: string): string => {
  const map: Record<string, string> = {
    pain_pressure: 'Pain or Pressure',
    fit_concern: 'Fit Concern',
    gum_irritation: 'Gum Irritation',
    sharp_edge: 'Sharp Edge',
    attachment_concern: 'Attachment Concern',
    speech_difficulty: 'Speech Difficulty',
    eating_difficulty: 'Eating Difficulty',
    cleaning_difficulty: 'Cleaning Difficulty',
    lost_damaged: 'Lost or Damaged',
    other: 'Other Note',
  };
  return map[category] || category;
};
