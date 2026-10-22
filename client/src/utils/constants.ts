export const APP_NAME = 'AlignTrack';
export const APP_TAGLINE = 'Your smile journey, one day at a time ✨';

export const JOURNAL_CATEGORIES = [
  { value: 'pain_pressure', label: 'Pain or Pressure', icon: 'AlertCircle' },
  { value: 'fit_concern', label: 'Fit Concern', icon: 'Crosshair' },
  { value: 'gum_irritation', label: 'Gum Irritation', icon: 'Flame' },
  { value: 'sharp_edge', label: 'Sharp Edge', icon: 'Scissors' },
  { value: 'attachment_concern', label: 'Attachment Concern', icon: 'ShieldAlert' },
  { value: 'speech_difficulty', label: 'Speech Difficulty', icon: 'Volume2' },
  { value: 'eating_difficulty', label: 'Eating Difficulty', icon: 'Utensils' },
  { value: 'cleaning_difficulty', label: 'Cleaning Difficulty', icon: 'Sparkles' },
  { value: 'lost_damaged', label: 'Lost or Damaged Aligner', icon: 'AlertTriangle' },
  { value: 'other', label: 'Other', icon: 'FileText' },
];

export const SEVERITY_LEVELS = [
  { value: 'Mild', label: 'Mild (Noticeable but comfortable)' },
  { value: 'Moderate', label: 'Moderate (Bothersome, needs monitoring)' },
  { value: 'Severe', label: 'Severe (Painful, discuss with orthodontist)' },
];

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority (Must Ask)' },
];

export const CALENDAR_COLORS = {
  aligner_start_planned: '#9B8AFB',
  aligner_change_planned: '#9B8AFB',
  aligner_start_actual: '#7775E8',
  aligner_change_actual: '#7775E8',
  appointment: '#FFD8CE',
  wear_target: '#BDEBD9',
  journal: '#FFB3AB',
  note: '#D4CCFF',
};
