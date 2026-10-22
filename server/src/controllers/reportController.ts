import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { generateVisitReport, generateTreatmentSummary } from '../services/reportGenerator';
import WearSession from '../models/WearSession';
import User from '../models/User';
import { calculateDailyWearMinutes } from '../services/wearTimeCalculation';
import { sendSuccess } from '../utils/response';
import { BadRequestError } from '../utils/errors';
import { parseISO, format, eachDayOfInterval } from 'date-fns';

export const getVisitReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { appointmentId } = req.query;

    const report = await generateVisitReport(userId!, appointmentId as string);
    sendSuccess(res, report);
  } catch (error) {
    next(error);
  }
};

export const getTreatmentSummary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const summary = await generateTreatmentSummary(userId!);
    sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
};

export const getWearTimeReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new BadRequestError('startDate and endDate are required');
    }

    const user = await User.findById(userId);
    const tz = user?.timezone || 'Asia/Kolkata';

    const sessions = await WearSession.find({
      userId,
      startTime: { $gte: parseISO(startDate as string) },
    });

    const days = eachDayOfInterval({
      start: parseISO(startDate as string),
      end: parseISO(endDate as string),
    }).map((d) => format(d, 'yyyy-MM-dd'));

    const dailyBreakdowns = [];
    let totalMinutesAllDays = 0;
    let daysWithData = 0;
    let daysMeetingTarget = 0;

    for (const day of days) {
      const { totalMinutes, sessionBreakdown } = calculateDailyWearMinutes(sessions, day, tz);
      const hours = Math.round((totalMinutes / 60) * 10) / 10;
      if (hours > 0) {
        daysWithData++;
        totalMinutesAllDays += totalMinutes;
        if (hours >= 18) {
          daysMeetingTarget++;
        }
      }
      dailyBreakdowns.push({
        date: day,
        totalMinutes,
        totalHours: hours,
        targetMet: hours >= 18,
        sessionCount: sessionBreakdown.length,
      });
    }

    const averageDailyHours = daysWithData > 0 ? Math.round(((totalMinutesAllDays / 60) / daysWithData) * 10) / 10 : 0;
    const targetMetPercentage = daysWithData > 0 ? Math.round((daysMeetingTarget / daysWithData) * 100) : 0;

    sendSuccess(res, {
      startDate,
      endDate,
      totalDaysInRange: days.length,
      daysTracked: daysWithData,
      averageDailyHours,
      targetMetPercentage,
      isIncomplete: daysWithData < days.length,
      dailyBreakdowns,
    });
  } catch (error) {
    next(error);
  }
};
