import { body, query, param } from 'express-validator';

// Auth validators
export const registerValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('displayName').optional().trim(),
  body('timezone').optional().isString(),
];

export const loginValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const updateProfileValidators = [
  body('displayName').optional().trim(),
  body('timezone').optional().isString(),
];

export const changePasswordValidators = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
];

// Aligner Set validators
export const createSetValidators = [
  body('setNumber').isInt({ min: 1 }).withMessage('Set number must be an integer >= 1'),
  body('label').optional().isString(),
  body('plannedStartDate').optional().isISO8601().withMessage('Planned start date must be a valid date'),
  body('plannedStartTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('actualStartDate').optional().isISO8601().withMessage('Actual start date must be a valid date'),
  body('actualStartTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('plannedDurationDays').isInt({ min: 1, max: 90 }).withMessage('Duration must be between 1 and 90 days'),
  body('wearTimeTargetOverride').optional({ nullable: true }).isFloat({ min: 1, max: 24 }),
  body('notes').optional().isString(),
];

export const updateSetValidators = [
  body('plannedDurationDays').optional().isInt({ min: 1, max: 90 }),
  body('plannedStartDate').optional().isISO8601(),
  body('plannedStartTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('plannedChangeDate').optional().isISO8601(),
  body('plannedChangeTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('actualStartDate').optional().isISO8601(),
  body('actualStartTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('actualChangeDate').optional().isISO8601(),
  body('actualChangeTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('wearTimeTargetOverride').optional({ nullable: true }).isFloat({ min: 1, max: 24 }),
  body('notes').optional().isString(),
  body('status').optional().isIn(['planned', 'current', 'completed', 'paused', 'cancelled']),
];

export const confirmChangeValidators = [
  body('actualChangeDate').isISO8601().withMessage('Valid actual change date (YYYY-MM-DD) is required'),
  body('actualChangeTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('nextSetNumber').optional().isInt({ min: 1 }),
  body('nextSetPlannedDuration').optional().isInt({ min: 1, max: 90 }),
  body('nextSetActualStartDate').optional().isISO8601(),
  body('nextSetActualStartTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
];

export const generatePlanValidators = [
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('totalSets').isInt({ min: 1, max: 100 }).withMessage('Total sets must be between 1 and 100'),
  body('defaultDurationDays').optional().isInt({ min: 1, max: 90 }),
];

// Appointment validators
export const createAppointmentValidators = [
  body('title').notEmpty().withMessage('Appointment title is required').trim(),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:mm format'),
  body('provider').optional().isString().trim(),
  body('location').optional().isString().trim(),
  body('notes').optional().isString(),
  body('timezone').optional().isString(),
  body('reminderConfig').optional().isObject(),
];

export const updateAppointmentValidators = [
  body('title').optional().trim().notEmpty(),
  body('date').optional().isISO8601(),
  body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('provider').optional().isString().trim(),
  body('location').optional().isString().trim(),
  body('notes').optional().isString(),
  body('status').optional().isIn(['upcoming', 'completed', 'cancelled', 'rescheduled']),
  body('reminderConfig').optional().isObject(),
  body('postAppointmentNotes').optional().isString(),
];

export const rescheduleValidators = [
  body('date').isISO8601().withMessage('Valid new date is required'),
  body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('reason').optional().isString(),
];

// Journal validators
export const createJournalValidators = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('category').isIn([
    'pain_pressure',
    'fit_concern',
    'gum_irritation',
    'sharp_edge',
    'attachment_concern',
    'speech_difficulty',
    'eating_difficulty',
    'cleaning_difficulty',
    'lost_damaged',
    'other',
  ]).withMessage('Valid category is required'),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('severity').optional().isString(),
  body('affectedArea').optional().isString(),
  body('isOngoing').optional().isBoolean(),
  body('needsDiscussion').optional().isBoolean(),
  body('alignerSetId').optional().isMongoId(),
  body('appointmentId').optional().isMongoId(),
];

export const updateJournalValidators = [
  body('date').optional().isISO8601(),
  body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('category').optional().isString(),
  body('description').optional().notEmpty().trim(),
  body('severity').optional().isString(),
  body('affectedArea').optional().isString(),
  body('isOngoing').optional().isBoolean(),
  body('needsDiscussion').optional().isBoolean(),
  body('resolutionDate').optional().isISO8601(),
];

// Question validators
export const createQuestionValidators = [
  body('text').notEmpty().withMessage('Question text is required').trim(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('alignerSetId').optional().isMongoId(),
  body('journalEntryId').optional().isMongoId(),
  body('appointmentId').optional().isMongoId(),
];

export const updateQuestionValidators = [
  body('text').optional().trim().notEmpty(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('isCompleted').optional().isBoolean(),
  body('answerNotes').optional().isString(),
  body('appointmentId').optional().isMongoId(),
];

export const completeQuestionValidators = [
  body('answerNotes').optional().isString(),
];

// Settings validators
export const settingsTreatmentValidators = [
  body('phases').optional().isArray(),
  body('phases.*.name').optional().isString(),
  body('phases.*.startSet').isInt({ min: 1 }),
  body('phases.*.endSet').optional({ nullable: true }).isInt({ min: 1 }),
  body('phases.*.defaultDurationDays').isInt({ min: 1, max: 90 }),
  body('phases.*.defaultWearTimeTarget').isFloat({ min: 1, max: 24 }),
  body('schedulingMode').optional().isIn(['actual', 'planned']),
];

export const settingsNotificationValidators = [
  body('appointmentReminder1DayBefore').optional().isBoolean(),
  body('appointmentReminderDayOf').optional().isBoolean(),
  body('appointmentReminderTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('alignerReminder3DaysBefore').optional().isBoolean(),
  body('alignerReminder2DaysBefore').optional().isBoolean(),
  body('alignerReminder1DayBefore').optional().isBoolean(),
  body('alignerReminderOnDay').optional().isBoolean(),
  body('alignerOverdueReminder').optional().isBoolean(),
  body('wearTimeReminder').optional().isBoolean(),
  body('wearTimeReminderInterval').optional().isInt({ min: 1, max: 24 }),
];

// Wear Session validators
export const manualSessionValidators = [
  body('startTime').isISO8601().withMessage('Valid start time (ISO format) is required'),
  body('endTime').isISO8601().withMessage('Valid end time (ISO format) is required'),
  body('timezone').optional().isString(),
  body('alignerSetId').optional().isMongoId(),
];

export const editSessionValidators = [
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('flaggedForReview').optional().isBoolean(),
];
