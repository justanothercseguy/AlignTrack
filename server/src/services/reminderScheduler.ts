import cron from 'node-cron';
import { addDays, format, parseISO, differenceInCalendarDays } from 'date-fns';
import User from '../models/User';
import AlignerSet from '../models/AlignerSet';
import Appointment from '../models/Appointment';
import Notification from '../models/Notification';
import { sendPushNotification } from './pushNotification';

/**
 * Checks for upcoming appointment and aligner change reminders across all active users.
 */
export const checkAndScheduleReminders = async (): Promise<void> => {
  try {
    const users = await User.find({});
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    for (const user of users) {
      const userId = user._id.toString();

      // 1. Process Appointment Reminders
      const upcomingAppointments = await Appointment.find({
        userId,
        status: 'upcoming',
        date: { $gte: todayStr },
      });

      for (const appt of upcomingAppointments) {
        const daysUntil = differenceInCalendarDays(parseISO(appt.date), new Date());

        // 1 day before reminder
        if (daysUntil === 1 && appt.reminderConfig?.oneDayBefore) {
          const dedupKey = `appt_${appt._id}_1day`;
          const existing = await Notification.findOne({ userId, deduplicationKey: dedupKey });

          if (!existing) {
            const notif = await Notification.create({
              userId,
              type: 'appointment_reminder',
              title: 'Upcoming Appointment Tomorrow',
              message: `You have an appointment: "${appt.title}" scheduled for tomorrow${appt.time ? ` at ${appt.time}` : ''}. Review your questions and journal entries!`,
              relatedModel: 'Appointment',
              relatedId: appt._id,
              deduplicationKey: dedupKey,
              actionUrl: `/appointments`,
            });

            await sendPushNotification(userId, {
              title: notif.title,
              message: notif.message,
              actionUrl: notif.actionUrl,
              notificationId: notif._id.toString(),
            });
          }
        }

        // Day of reminder
        if (daysUntil === 0 && appt.reminderConfig?.dayOf) {
          const dedupKey = `appt_${appt._id}_dayof`;
          const existing = await Notification.findOne({ userId, deduplicationKey: dedupKey });

          if (!existing) {
            const notif = await Notification.create({
              userId,
              type: 'appointment_reminder',
              title: 'Appointment Today',
              message: `You have an appointment: "${appt.title}" today${appt.time ? ` at ${appt.time}` : ''}. Good luck!`,
              relatedModel: 'Appointment',
              relatedId: appt._id,
              deduplicationKey: dedupKey,
              actionUrl: `/appointments`,
            });

            await sendPushNotification(userId, {
              title: notif.title,
              message: notif.message,
              actionUrl: notif.actionUrl,
              notificationId: notif._id.toString(),
            });
          }
        }
      }

      // 2. Process Aligner Set Reminders
      const currentSet = await AlignerSet.findOne({ userId, status: 'current' });
      if (currentSet && currentSet.plannedChangeDate) {
        const daysUntil = differenceInCalendarDays(parseISO(currentSet.plannedChangeDate), new Date());
        const userPrefs = user.notificationPreferences;

        // 1 day before planned change
        if (daysUntil === 1 && userPrefs?.alignerReminder1DayBefore) {
          const dedupKey = `aligner_${currentSet._id}_1day`;
          const existing = await Notification.findOne({ userId, deduplicationKey: dedupKey });

          if (!existing) {
            const notif = await Notification.create({
              userId,
              type: 'aligner_change',
              title: `Set ${currentSet.setNumber} Change Reminder`,
              message: `Set ${currentSet.setNumber} is scheduled for review/change tomorrow, ${currentSet.plannedChangeDate}. Check your orthodontist's instructions.`,
              relatedModel: 'AlignerSet',
              relatedId: currentSet._id,
              deduplicationKey: dedupKey,
              actionUrl: `/aligners`,
            });

            await sendPushNotification(userId, {
              title: notif.title,
              message: notif.message,
              actionUrl: notif.actionUrl,
              notificationId: notif._id.toString(),
            });
          }
        }

        // On planned change date
        if (daysUntil === 0 && userPrefs?.alignerReminderOnDay) {
          const dedupKey = `aligner_${currentSet._id}_dayof`;
          const existing = await Notification.findOne({ userId, deduplicationKey: dedupKey });

          if (!existing) {
            const notif = await Notification.create({
              userId,
              type: 'aligner_change',
              title: `Set ${currentSet.setNumber} Planned Change Date`,
              message: `Today is the planned change date for Set ${currentSet.setNumber}. Once ready and confirmed with your orthodontist, log your switch!`,
              relatedModel: 'AlignerSet',
              relatedId: currentSet._id,
              deduplicationKey: dedupKey,
              actionUrl: `/aligners`,
            });

            await sendPushNotification(userId, {
              title: notif.title,
              message: notif.message,
              actionUrl: notif.actionUrl,
              notificationId: notif._id.toString(),
            });
          }
        }

        // Overdue reminder
        if (daysUntil < 0 && userPrefs?.alignerOverdueReminder) {
          const dedupKey = `aligner_${currentSet._id}_overdue_${todayStr}`;
          const existing = await Notification.findOne({ userId, deduplicationKey: dedupKey });

          if (!existing) {
            const notif = await Notification.create({
              userId,
              type: 'aligner_overdue',
              title: `Set ${currentSet.setNumber} Past Planned Change`,
              message: `Your scheduled change date (${currentSet.plannedChangeDate}) has passed. Confirm your next step with your orthodontist if the plan has changed.`,
              relatedModel: 'AlignerSet',
              relatedId: currentSet._id,
              deduplicationKey: dedupKey,
              actionUrl: `/aligners`,
            });

            await sendPushNotification(userId, {
              title: notif.title,
              message: notif.message,
              actionUrl: notif.actionUrl,
              notificationId: notif._id.toString(),
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error during reminder scheduler execution:', error);
  }
};

/**
 * Initializes the background cron job to check reminders every hour.
 */
export const initReminderScheduler = (): void => {
  // Check reminders immediately upon startup
  checkAndScheduleReminders().catch((err) =>
    console.error('Initial reminder check error:', err)
  );

  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    await checkAndScheduleReminders();
  });
};

export const startReminderScheduler = initReminderScheduler;

