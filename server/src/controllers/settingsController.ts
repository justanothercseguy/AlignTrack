import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import User from '../models/User';
import AlignerSet from '../models/AlignerSet';
import WearSession from '../models/WearSession';
import Appointment from '../models/Appointment';
import JournalEntry from '../models/JournalEntry';
import Question from '../models/Question';
import Notification from '../models/Notification';
import { sendSuccess } from '../utils/response';
import { NotFoundError } from '../utils/errors';

export const getSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    sendSuccess(res, {
      displayName: user.displayName,
      email: user.email,
      timezone: user.timezone,
      treatmentSettings: user.treatmentSettings,
      notificationPreferences: user.notificationPreferences,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTreatmentSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { phases, schedulingMode } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.treatmentSettings) {
      user.treatmentSettings = {
        schedulingMode: 'actual',
        phases: [
          { name: 'Phase A', startSet: 1, endSet: 5, defaultDurationDays: 10, defaultWearTimeTarget: 18 },
          { name: 'Phase B', startSet: 6, endSet: null, defaultDurationDays: 7, defaultWearTimeTarget: 20 },
        ],
      };
    }

    if (phases) {
      user.treatmentSettings.phases = phases;
      // Sync active set's target with the new phase target
      const currentSet = await AlignerSet.findOne({ userId, status: 'current' });
      if (currentSet) {
        const matchingPhase = phases.find(
          (p: any) => currentSet.setNumber >= p.startSet && (!p.endSet || currentSet.setNumber <= p.endSet)
        );
        if (matchingPhase && matchingPhase.defaultWearTimeTarget) {
          currentSet.wearTimeTargetOverride = matchingPhase.defaultWearTimeTarget;
          await currentSet.save();
        }
      }
    }
    if (schedulingMode) user.treatmentSettings.schedulingMode = schedulingMode;

    await user.save();

    sendSuccess(res, user.treatmentSettings, 'Treatment settings updated');
  } catch (error) {
    next(error);
  }
};

export const updateNotificationPreferences = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const preferences = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.notificationPreferences) {
      user.notificationPreferences = {
        appointmentReminder1DayBefore: true,
        appointmentReminderDayOf: false,
        appointmentReminderTime: '09:00',
        alignerReminder3DaysBefore: false,
        alignerReminder2DaysBefore: false,
        alignerReminder1DayBefore: true,
        alignerReminderOnDay: false,
        alignerOverdueReminder: true,
        wearTimeReminder: false,
        wearTimeReminderInterval: 4,
      };
    }

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...preferences,
    };

    await user.save();

    sendSuccess(res, user.notificationPreferences, 'Notification preferences updated');
  } catch (error) {
    next(error);
  }
};

export const updateWearTimeSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { phaseATarget, phaseBTarget, transitionSet, targetHours } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.treatmentSettings) {
      user.treatmentSettings = {
        schedulingMode: 'actual',
        phases: [
          { name: 'Phase A', startSet: 1, endSet: 5, defaultDurationDays: 10, defaultWearTimeTarget: 18 },
          { name: 'Phase B', startSet: 6, endSet: null, defaultDurationDays: 7, defaultWearTimeTarget: 20 },
        ],
      };
    }

    const effectiveTargetA =
      targetHours !== undefined
        ? Number(targetHours)
        : phaseATarget !== undefined
        ? Number(phaseATarget)
        : user.treatmentSettings.phases[0]?.defaultWearTimeTarget || 18;

    const effectiveTargetB =
      phaseBTarget !== undefined
        ? Number(phaseBTarget)
        : user.treatmentSettings.phases[1]?.defaultWearTimeTarget || 20;

    const tSet = transitionSet || user.treatmentSettings.phases[1]?.startSet || 6;

    user.treatmentSettings.phases = [
      {
        name: 'Phase A',
        startSet: 1,
        endSet: tSet - 1,
        defaultDurationDays: user.treatmentSettings.phases[0]?.defaultDurationDays || 10,
        defaultWearTimeTarget: effectiveTargetA,
      },
      {
        name: 'Phase B',
        startSet: tSet,
        endSet: undefined,
        defaultDurationDays: user.treatmentSettings.phases[1]?.defaultDurationDays || 7,
        defaultWearTimeTarget: effectiveTargetB,
      },
    ];

    await user.save();

    // Also update current active set's target override so it immediately takes effect
    const currentSet = await AlignerSet.findOne({ userId, status: 'current' });
    if (currentSet) {
      currentSet.wearTimeTargetOverride = effectiveTargetA;
      await currentSet.save();
    }

    sendSuccess(res, { treatmentSettings: user.treatmentSettings, currentSet }, 'Wear time target updated successfully');
  } catch (error) {
    next(error);
  }
};

export const exportData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    const [user, alignerSets, wearSessions, appointments, journalEntries, questions, notifications] =
      await Promise.all([
        User.findById(userId).select('-password'),
        AlignerSet.find({ userId }),
        WearSession.find({ userId }),
        Appointment.find({ userId }),
        JournalEntry.find({ userId }),
        Question.find({ userId }),
        Notification.find({ userId }),
      ]);

    const exportPayload = {
      exportDate: new Date().toISOString(),
      user,
      alignerSets,
      wearSessions,
      appointments,
      journalEntries,
      questions,
      notifications,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="aligntrack-backup.json"');
    res.status(200).json(exportPayload);
  } catch (error) {
    next(error);
  }
};
