import { Document, Types } from 'mongoose';
import { Request } from 'express';

// Phase configuration
export interface PhaseConfig {
  name: string;
  startSet: number;
  endSet?: number;
  defaultDurationDays: number;
  defaultWearTimeTarget: number; // hours
}

// Treatment settings
export interface TreatmentSettings {
  phases: PhaseConfig[];
  schedulingMode: 'actual' | 'planned';
}

// Notification preferences
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

// User document
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  displayName: string;
  timezone: string;
  notificationPreferences: NotificationPreferences;
  treatmentSettings: TreatmentSettings;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Aligner reminder preferences
export interface AlignerReminderPreferences {
  reminder3DaysBefore?: boolean;
  reminder2DaysBefore?: boolean;
  reminder1DayBefore?: boolean;
  reminderOnDay?: boolean;
}

// AlignerSet document
export interface IAlignerSet extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
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
  wearTimeTargetOverride?: number;
  status: 'planned' | 'current' | 'completed' | 'paused' | 'cancelled';
  notes?: string;
  reminderPreferences?: AlignerReminderPreferences;
  createdAt: Date;
  updatedAt: Date;
}

// Session correction
export interface SessionCorrection {
  field: string;
  oldValue: any;
  newValue: any;
  correctedAt: Date;
}

// WearSession document
export interface IWearSession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  alignerSetId?: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  timezone: string;
  source: 'timer' | 'manual';
  isActive: boolean;
  corrections: SessionCorrection[];
  flaggedForReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Appointment document
export interface ReminderConfig {
  oneDayBefore: boolean;
  dayOf: boolean;
  customMinutesBefore?: number;
  reminderTime?: string;
}

export interface IAppointment extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  provider?: string;
  date: string;
  time?: string;
  timezone: string;
  location?: string;
  notes?: string;
  questionsToAsk: string[];
  issuesToDiscuss: Types.ObjectId[];
  status: 'upcoming' | 'completed' | 'cancelled' | 'rescheduled';
  reminderConfig: ReminderConfig;
  postAppointmentNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Attachment
export interface Attachment {
  filename: string;
  path: string;
  uploadedAt: Date;
}

// JournalEntry document
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

export interface IJournalEntry extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  alignerSetId?: Types.ObjectId;
  appointmentId?: Types.ObjectId;
  date: string;
  time?: string;
  category: JournalCategory;
  severity?: string;
  affectedArea?: string;
  description: string;
  startDate?: string;
  resolutionDate?: string;
  isOngoing: boolean;
  needsDiscussion: boolean;
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

// Question document
export interface IQuestion extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  priority: 'low' | 'medium' | 'high';
  alignerSetId?: Types.ObjectId;
  journalEntryId?: Types.ObjectId;
  appointmentId?: Types.ObjectId;
  isCompleted: boolean;
  answerNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification types
export type NotificationType =
  | 'appointment_reminder'
  | 'aligner_change'
  | 'aligner_overdue'
  | 'wear_time'
  | 'data_warning'
  | 'system';
export type DeliveryStatus = 'pending' | 'delivered' | 'failed' | 'cancelled';

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedModel?: 'AlignerSet' | 'Appointment' | 'JournalEntry';
  relatedId?: Types.ObjectId;
  scheduledFor?: Date;
  deliveredAt?: Date;
  deliveryStatus: DeliveryStatus;
  isRead: boolean;
  readAt?: Date;
  deduplicationKey?: string;
  retryCount: number;
  maxRetries: number;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// PushSubscription document
export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

export interface IPushSubscription extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  subscription: PushSubscriptionData;
  userAgent?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Authenticated Request
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Daily wear summary
export interface DailyWearSummary {
  date: string;
  totalMinutes: number;
  totalHours: number;
  targetHours: number;
  remainingHours: number;
  extraHours: number;
  targetMet: boolean;
  sessions: Array<{
    startTime: Date;
    endTime: Date | null;
    durationMinutes: number;
  }>;
}

// Calendar event
export interface CalendarEvent {
  id: string;
  type: 'aligner_change' | 'appointment' | 'journal_entry' | 'reminder';
  title: string;
  date: string;
  time?: string;
  details?: any;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Visit report
export interface VisitReport {
  appointment: IAppointment;
  questionsToAsk: IQuestion[];
  issuesForDiscussion: IJournalEntry[];
  wearTimeSummary: {
    averageDailyHours: number;
    daysTracked: number;
    targetMetPercentage: number;
  };
  recentJournalEntries: IJournalEntry[];
  currentAligner: IAlignerSet | null;
}

// Treatment summary
export interface TreatmentSummary {
  totalSets: number;
  completedSets: number;
  currentSet: IAlignerSet | null;
  treatmentProgress: number;
  averageWearTime: number;
  overallCompliance: number;
  upcomingAppointment: IAppointment | null;
  unresolvedIssues: number;
  unansweredQuestions: number;
}
