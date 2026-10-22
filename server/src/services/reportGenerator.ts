import AlignerSet from '../models/AlignerSet';
import Appointment from '../models/Appointment';
import JournalEntry from '../models/JournalEntry';
import Question from '../models/Question';
import WearSession from '../models/WearSession';
import User from '../models/User';
import { calculateDailyWearMinutes } from './wearTimeCalculation';
import { calculateDaysElapsed, calculateDaysRemaining, isSetOverdue } from './dateCalculation';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';

export const generateVisitReport = async (userId: string, appointmentId?: string) => {
  const user = await User.findById(userId);
  const currentSet = await AlignerSet.findOne({ userId, status: 'current' });
  const allSets = await AlignerSet.find({ userId }).sort({ setNumber: 1 });

  let appointment = null;
  if (appointmentId) {
    appointment = await Appointment.findOne({ _id: appointmentId, userId });
  } else {
    appointment = await Appointment.findOne({ userId, status: 'upcoming' }).sort({ date: 1 });
  }

  // Get unresolved issues or issues flagged for discussion
  const issuesForDiscussion = await JournalEntry.find({
    userId,
    $or: [{ needsDiscussion: true }, { isOngoing: true }],
  }).sort({ date: -1 });

  // Get recent journal entries (past 30 days)
  const recentJournalEntries = await JournalEntry.find({ userId }).sort({ date: -1 }).limit(10);

  // Get questions (if appointmentId, filter or get all unanswered)
  const questionsToAsk = await Question.find({
    userId,
    isCompleted: false,
  }).sort({ priority: -1, createdAt: -1 });

  // Wear time summary for past 14 days
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const past14DaysStr = format(subDays(new Date(), 14), 'yyyy-MM-dd');

  const sessions = await WearSession.find({
    userId,
    startTime: { $gte: parseISO(past14DaysStr) },
  });

  const daysList = eachDayOfInterval({
    start: parseISO(past14DaysStr),
    end: parseISO(todayStr),
  }).map((d) => format(d, 'yyyy-MM-dd'));

  let totalLoggedHours = 0;
  let daysWithTracking = 0;
  let targetMetDays = 0;

  for (const day of daysList) {
    const { totalMinutes } = calculateDailyWearMinutes(sessions, day, user?.timezone || 'Asia/Kolkata');
    const hours = Math.round((totalMinutes / 60) * 10) / 10;
    if (hours > 0) {
      daysWithTracking++;
      totalLoggedHours += hours;
      if (hours >= 18) {
        targetMetDays++;
      }
    }
  }

  const averageDailyHours = daysWithTracking > 0 ? Math.round((totalLoggedHours / daysWithTracking) * 10) / 10 : 0;
  const targetMetPercentage = daysWithTracking > 0 ? Math.round((targetMetDays / daysWithTracking) * 100) : 0;

  return {
    patientName: user?.displayName || user?.email || 'Patient',
    appointment,
    currentAligner: currentSet,
    alignerHistory: allSets,
    wearTimeSummary: {
      averageDailyHours,
      daysTracked: daysWithTracking,
      targetMetPercentage,
      totalDaysInRange: daysList.length,
      incompleteData: daysWithTracking < daysList.length,
    },
    issuesForDiscussion,
    recentJournalEntries,
    questionsToAsk,
    generatedAt: new Date().toISOString(),
  };
};

export const generateTreatmentSummary = async (userId: string) => {
  const allSets = await AlignerSet.find({ userId }).sort({ setNumber: 1 });
  const currentSet = await AlignerSet.findOne({ userId, status: 'current' });
  const completedSets = allSets.filter((s) => s.status === 'completed');
  const upcomingAppointment = await Appointment.findOne({ userId, status: 'upcoming' }).sort({ date: 1 });
  const unresolvedIssuesCount = await JournalEntry.countDocuments({ userId, isOngoing: true });
  const unansweredQuestionsCount = await Question.countDocuments({ userId, isCompleted: false });

  // Current set details
  let currentSetDetails = null;
  if (currentSet) {
    const daysElapsed = calculateDaysElapsed(currentSet.actualStartDate || currentSet.plannedStartDate || '');
    const daysRemaining = calculateDaysRemaining(currentSet.plannedChangeDate || '');
    const isOverdue = isSetOverdue(currentSet.plannedChangeDate || '', currentSet.status);

    currentSetDetails = {
      ...currentSet.toObject(),
      daysElapsed,
      daysRemaining,
      isOverdue,
    };
  }

  const totalSets = allSets.length;
  const progressPercent = totalSets > 0 ? Math.round((completedSets.length / totalSets) * 100) : 0;

  return {
    totalSets,
    completedSets: completedSets.length,
    currentSet: currentSetDetails,
    treatmentProgress: progressPercent,
    upcomingAppointment,
    unresolvedIssuesCount,
    unansweredQuestionsCount,
  };
};
