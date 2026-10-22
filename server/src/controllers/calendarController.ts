import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import AlignerSet from '../models/AlignerSet';
import Appointment from '../models/Appointment';
import JournalEntry from '../models/JournalEntry';
import WearSession from '../models/WearSession';
import User from '../models/User';
import { calculateDailyWearMinutes } from '../services/wearTimeCalculation';
import { sendSuccess } from '../utils/response';
import { parseISO, startOfMonth, endOfMonth, format, eachDayOfInterval } from 'date-fns';

export const getCalendarEvents = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { month } = req.query; // YYYY-MM

    let startDateStr: string;
    let endDateStr: string;

    if (month && typeof month === 'string') {
      const parsedMonth = parseISO(`${month}-01`);
      startDateStr = format(startOfMonth(parsedMonth), 'yyyy-MM-dd');
      endDateStr = format(endOfMonth(parsedMonth), 'yyyy-MM-dd');
    } else {
      const now = new Date();
      startDateStr = format(startOfMonth(now), 'yyyy-MM-dd');
      endDateStr = format(endOfMonth(now), 'yyyy-MM-dd');
    }

    const events: any[] = [];

    // 1. Aligner Sets
    const sets = await AlignerSet.find({ userId });
    for (const set of sets) {
      // Actual start date
      if (set.actualStartDate && set.actualStartDate >= startDateStr && set.actualStartDate <= endDateStr) {
        events.push({
          id: `set_start_actual_${set._id}`,
          type: 'aligner_start_actual',
          title: `Started Set ${set.setNumber}`,
          date: set.actualStartDate,
          color: '#7775E8', // Blue periwinkle for actual milestones
          category: 'aligner',
          details: { setNumber: set.setNumber, status: set.status },
        });
      } else if (set.plannedStartDate && set.plannedStartDate >= startDateStr && set.plannedStartDate <= endDateStr && !set.actualStartDate) {
        events.push({
          id: `set_start_planned_${set._id}`,
          type: 'aligner_start_planned',
          title: `Planned: Start Set ${set.setNumber}`,
          date: set.plannedStartDate,
          color: '#9B8AFB', // Lavender
          category: 'aligner',
          details: { setNumber: set.setNumber, status: set.status },
        });
      }

      // Actual change date
      if (set.actualChangeDate && set.actualChangeDate >= startDateStr && set.actualChangeDate <= endDateStr) {
        events.push({
          id: `set_change_actual_${set._id}`,
          type: 'aligner_change_actual',
          title: `Changed Set ${set.setNumber}`,
          date: set.actualChangeDate,
          color: '#7775E8',
          category: 'aligner',
          details: { setNumber: set.setNumber },
        });
      }

      // Planned change date
      if (set.plannedChangeDate && set.plannedChangeDate >= startDateStr && set.plannedChangeDate <= endDateStr) {
        events.push({
          id: `set_change_planned_${set._id}`,
          type: 'aligner_change_planned',
          title: `Planned: Change Set ${set.setNumber}`,
          date: set.plannedChangeDate,
          color: '#9B8AFB',
          category: 'aligner',
          details: { setNumber: set.setNumber, status: set.status },
        });
      }
    }

    // 2. Appointments
    const appointments = await Appointment.find({
      userId,
      date: { $gte: startDateStr, $lte: endDateStr },
    });
    for (const appt of appointments) {
      events.push({
        id: `appt_${appt._id}`,
        type: 'appointment',
        title: `${appt.title}${appt.time ? ` (${appt.time})` : ''}`,
        date: appt.date,
        time: appt.time,
        color: '#FFD8CE', // Soft peach accent
        category: 'appointment',
        details: {
          provider: appt.provider,
          location: appt.location,
          status: appt.status,
          notes: appt.notes,
        },
      });
    }

    // 3. Journal entries
    const journalEntries = await JournalEntry.find({
      userId,
      date: { $gte: startDateStr, $lte: endDateStr },
    });
    for (const entry of journalEntries) {
      events.push({
        id: `journal_${entry._id}`,
        type: 'journal',
        title: `${entry.category.replace('_', ' ')} (${entry.severity || 'Mild'})`,
        date: entry.date,
        time: entry.time,
        color: entry.needsDiscussion ? '#FFB3AB' : '#A0A0B0', // Coral if flagged, otherwise neutral
        category: 'journal',
        details: {
          category: entry.category,
          severity: entry.severity,
          description: entry.description,
          needsDiscussion: entry.needsDiscussion,
          isOngoing: entry.isOngoing,
        },
      });
    }

    // 4. Wear time daily achievements
    const user = await User.findById(userId);
    const sessions = await WearSession.find({
      userId,
      startTime: { $gte: parseISO(startDateStr) },
    });

    const days = eachDayOfInterval({
      start: parseISO(startDateStr),
      end: parseISO(endDateStr),
    }).map((d) => format(d, 'yyyy-MM-dd'));

    for (const day of days) {
      const { totalMinutes } = calculateDailyWearMinutes(sessions, day, user?.timezone || 'Asia/Kolkata');
      const hours = Math.round((totalMinutes / 60) * 10) / 10;
      if (hours >= 18) {
        events.push({
          id: `wear_target_${day}`,
          type: 'wear_target',
          title: `🎯 Target Met (${hours}h)`,
          date: day,
          color: '#BDEBD9', // Soft mint accent
          category: 'wear_time',
          details: { hours, totalMinutes },
        });
      }
    }

    sendSuccess(res, events);
  } catch (error) {
    next(error);
  }
};
