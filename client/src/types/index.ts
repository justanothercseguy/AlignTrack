export interface User {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  notificationPreferences: NotificationPreferences;
  treatmentSettings: TreatmentSettings;
}

export interface PhaseConfig {
  name: string;
  startSet: number;
  endSet?: number | null;
  defaultDurationDays: number;
  defaultWearTimeTarget: number;
}

export interface TreatmentSettings {
  phases: PhaseConfig[];
  schedulingMode: 'actual' | 'planned';
}

export interface NotificationPreferences {
  appointmentReminder1DayBefore: boolean;
  appointmentReminderDayOf: boolean;
  appointmentReminderTime: string;
  alignerReminder3DaysBefore: boolean;
  alignerReminder2DaysBefore: boolean;
  alignerReminder1DayBefore: boolean;
  alignerReminderOnDay: boolean;
  alignerOverdueReminder: boolean;
  wearTimeReminder: boolean;
  wearTimeReminderInterval: number;
}

export interface AlignerSet {
  _id: string;
  userId: string;
  setNumber: number;
  label?: string;
  plannedStartDate?: string;
  plannedStartTime?: string;
  actualStartDate?: string;
  actualStartTime?: string;
  plannedDurationDays: number;
  plannedChangeDate?: string;
  plannedChangeTime?: string;
  actualChangeDate?: string;
  actualChangeTime?: string;
  wearTimeTargetOverride?: number | null;
  status: 'planned' | 'current' | 'completed' | 'paused' | 'cancelled';
  notes?: string;
  reminderPreferences?: {
    reminder3DaysBefore?: boolean;
    reminder2DaysBefore?: boolean;
    reminder1DayBefore?: boolean;
    reminderOnDay?: boolean;
  };
  daysElapsed?: number;
  daysRemaining?: number;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WearSession {
  _id: string;
  userId: string;
  alignerSetId?: string | null;
  startTime: string;
  endTime?: string | null;
  timezone: string;
  source: 'timer' | 'manual';
  isActive: boolean;
  elapsedMinutes?: number;
  flaggedForReview?: boolean;
  corrections?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    correctedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface DailyWearSummary {
  date: string;
  totalMinutes: number;
  totalHours: number;
  targetHours: number;
  remainingHours: number;
  extraHours: number;
  targetMet: boolean;
  sessions: Array<{
    startTime: string;
    endTime: string | null;
    durationMinutes: number;
  }>;
}

export interface Appointment {
  _id: string;
  userId: string;
  title: string;
  provider?: string;
  date: string;
  time?: string;
  timezone: string;
  location?: string;
  notes?: string;
  questionsToAsk?: string[];
  issuesToDiscuss?: any[];
  status: 'upcoming' | 'completed' | 'cancelled' | 'rescheduled';
  reminderConfig?: {
    oneDayBefore: boolean;
    dayOf: boolean;
    customMinutesBefore?: number;
    reminderTime?: string;
  };
  postAppointmentNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type JournalCategory =
  | 'pain_pressure'
  | 'fit_concern'
  | 'gum_irritation'
  | 'sharp_edge'
  | 'attachment_concern'
  | 'speech_difficulty'
  | 'eating_difficulty'
  | 'cleaning_difficulty'
  | 'lost_damaged'
  | 'other';

export interface JournalEntry {
  _id: string;
  userId: string;
  alignerSetId?: string | null;
  appointmentId?: string | null;
  date: string;
  time?: string;
  category: JournalCategory;
  severity?: string;
  affectedArea?: string;
  description: string;
  startDate?: string;
  resolutionDate?: string | null;
  isOngoing: boolean;
  needsDiscussion: boolean;
  attachments?: Array<{
    filename: string;
    path: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  userId: string;
  text: string;
  priority: 'low' | 'medium' | 'high';
  alignerSetId?: string | null;
  journalEntryId?: string | null;
  appointmentId?: string | null;
  isCompleted: boolean;
  answerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  type: 'appointment_reminder' | 'aligner_change' | 'aligner_overdue' | 'wear_time' | 'data_warning' | 'system';
  title: string;
  message: string;
  relatedModel?: string;
  relatedId?: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  type: string;
  title: string;
  date: string;
  time?: string;
  color: string;
  category: 'aligner' | 'appointment' | 'journal' | 'wear_time' | 'note';
  details?: any;
}

export interface TreatmentSummary {
  totalSets: number;
  completedSets: number;
  currentSet: AlignerSet | null;
  treatmentProgress: number;
  upcomingAppointment: Appointment | null;
  unresolvedIssuesCount: number;
  unansweredQuestionsCount: number;
}
