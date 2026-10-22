import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import WearSession from '../models/WearSession';
import AlignerSet from '../models/AlignerSet';
import User from '../models/User';
import {
  computeDailySummary,
  hasOverlappingSession,
} from '../services/wearTimeCalculation';
import { getEffectiveWearTarget } from '../services/dateCalculation';
import { sendSuccess } from '../utils/response';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';

export const startSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { timezone, startTime } = req.body;

    const user = await User.findById(userId);
    const tz = timezone || user?.timezone || 'Asia/Kolkata';

    // Check if an active session already exists
    let existingActive = await WearSession.findOne({ userId, isActive: true });
    if (existingActive) {
      if (startTime) {
        existingActive.startTime = new Date(startTime);
        await existingActive.save();
      }
      sendSuccess(res, existingActive, 'Wear session is already running');
      return;
    }

    // Find current aligner set
    const currentSet = await AlignerSet.findOne({ userId, status: 'current' });
    const sessionStart = startTime ? new Date(startTime) : new Date();

    const newSession = await WearSession.create({
      userId,
      alignerSetId: currentSet?._id || null,
      startTime: sessionStart,
      endTime: null,
      timezone: tz,
      source: 'timer',
      isActive: true,
    });

    sendSuccess(res, newSession, 'Wear session started', 201);
  } catch (error) {
    next(error);
  }
};

export const stopSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { endTime, startTime } = req.body;

    let activeSession = await WearSession.findOne({ userId, isActive: true });
    const end = endTime ? new Date(endTime) : new Date();

    // If no active session was found in DB (e.g. server restarted or lost memory),
    // but the client has an active entry from local storage, restore and complete it!
    if (!activeSession) {
      if (startTime) {
        const start = new Date(startTime);
        const currentSet = await AlignerSet.findOne({ userId, status: 'current' });
        const user = await User.findById(userId);
        const tz = user?.timezone || 'Asia/Kolkata';

        activeSession = await WearSession.create({
          userId,
          alignerSetId: currentSet?._id || null,
          startTime: start,
          endTime: end,
          timezone: tz,
          source: 'timer',
          isActive: false,
        });
      } else {
        throw new NotFoundError('No active wear session found');
      }
    } else {
      if (startTime) {
        activeSession.startTime = new Date(startTime);
      }
      activeSession.endTime = end;
      activeSession.isActive = false;

      // Flag for review if longer than 24 hours
      const durationHours = (end.getTime() - new Date(activeSession.startTime).getTime()) / (1000 * 60 * 60);
      if (durationHours > 24) {
        activeSession.flaggedForReview = true;
      }

      await activeSession.save();
    }

    // Compute today's summary
    const user = await User.findById(userId);
    const tz = activeSession.timezone || user?.timezone || 'Asia/Kolkata';
    const todayStr = format(end, 'yyyy-MM-dd');

    const currentSet = await AlignerSet.findOne({ userId, status: 'current' });
    const target = getEffectiveWearTarget(
      currentSet?.setNumber || 1,
      user?.treatmentSettings,
      currentSet?.wearTimeTargetOverride
    );

    const allSessionsToday = await WearSession.find({ userId });
    const dailySummary = computeDailySummary(allSessionsToday, todayStr, target, tz);

    sendSuccess(res, { session: activeSession, dailySummary }, 'Wear session stopped');
  } catch (error) {
    next(error);
  }
};

export const getActiveSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const activeSession = await WearSession.findOne({ userId, isActive: true });

    if (!activeSession) {
      sendSuccess(res, null, 'No active session');
      return;
    }

    const elapsedMinutes = Math.round(
      (new Date().getTime() - new Date(activeSession.startTime).getTime()) / (1000 * 60)
    );

    sendSuccess(res, {
      ...activeSession.toObject(),
      elapsedMinutes,
    });
  } catch (error) {
    next(error);
  }
};

export const addManualSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { startTime, endTime, timezone, alignerSetId } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end.getTime() <= start.getTime()) {
      throw new BadRequestError('End time must be after start time');
    }

    // Check for overlap
    const isOverlapping = await hasOverlappingSession(userId!, start, end);
    if (isOverlapping) {
      throw new ConflictError('Wear session overlaps with an existing logged session');
    }

    const user = await User.findById(userId);
    const tz = timezone || user?.timezone || 'Asia/Kolkata';

    let setId = alignerSetId;
    if (!setId) {
      const currentSet = await AlignerSet.findOne({ userId, status: 'current' });
      setId = currentSet?._id || null;
    }

    const session = await WearSession.create({
      userId,
      alignerSetId: setId,
      startTime: start,
      endTime: end,
      timezone: tz,
      source: 'manual',
      isActive: false,
    });

    sendSuccess(res, session, 'Manual wear session added', 201);
  } catch (error) {
    next(error);
  }
};

export const listSessions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { date, alignerSetId, limit = 50 } = req.query;

    const filter: any = { userId };
    if (alignerSetId) {
      filter.alignerSetId = alignerSetId;
    }

    const sessions = await WearSession.find(filter)
      .sort({ startTime: -1 })
      .limit(Number(limit));

    sendSuccess(res, sessions);
  } catch (error) {
    next(error);
  }
};

export const editSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { startTime, endTime, flaggedForReview } = req.body;

    const session = await WearSession.findOne({ _id: id, userId });
    if (!session) {
      throw new NotFoundError('Wear session not found');
    }

    const corrections = [...session.corrections];

    if (startTime) {
      const newStart = new Date(startTime);
      corrections.push({
        field: 'startTime',
        oldValue: session.startTime,
        newValue: newStart,
        correctedAt: new Date(),
      });
      session.startTime = newStart;
    }

    if (endTime) {
      const newEnd = new Date(endTime);
      corrections.push({
        field: 'endTime',
        oldValue: session.endTime,
        newValue: newEnd,
        correctedAt: new Date(),
      });
      session.endTime = newEnd;
    }

    if (flaggedForReview !== undefined) {
      session.flaggedForReview = flaggedForReview;
    }

    session.corrections = corrections;
    await session.save();

    sendSuccess(res, session, 'Wear session updated');
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const session = await WearSession.findOneAndDelete({ _id: id, userId });
    if (!session) {
      throw new NotFoundError('Wear session not found');
    }

    sendSuccess(res, null, 'Wear session deleted');
  } catch (error) {
    next(error);
  }
};

export const getDailySummary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { date } = req.query;

    const user = await User.findById(userId);
    const tz = user?.timezone || 'Asia/Kolkata';
    const targetDate = (date as string) || format(new Date(), 'yyyy-MM-dd');

    const currentSet = await AlignerSet.findOne({ userId, status: 'current' });
    const target = getEffectiveWearTarget(
      currentSet?.setNumber || 1,
      user?.treatmentSettings,
      currentSet?.wearTimeTargetOverride
    );

    const sessions = await WearSession.find({ userId });
    const summary = computeDailySummary(sessions, targetDate, target, tz);

    sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
};

export const getWeeklySummary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    const tz = user?.timezone || 'Asia/Kolkata';

    const currentSet = await AlignerSet.findOne({ userId, status: 'current' });
    const target = getEffectiveWearTarget(
      currentSet?.setNumber || 1,
      user?.treatmentSettings,
      currentSet?.wearTimeTargetOverride
    );

    const sessions = await WearSession.find({ userId });

    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const summary = computeDailySummary(sessions, dateStr, target, tz);
      days.push(summary);
    }

    sendSuccess(res, days);
  } catch (error) {
    next(error);
  }
};

export const getPeriodSummary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new BadRequestError('Both startDate and endDate are required');
    }

    const user = await User.findById(userId);
    const tz = user?.timezone || 'Asia/Kolkata';

    const currentSet = await AlignerSet.findOne({ userId, status: 'current' });
    const target = getEffectiveWearTarget(
      currentSet?.setNumber || 1,
      user?.treatmentSettings,
      currentSet?.wearTimeTargetOverride
    );

    const sessions = await WearSession.find({ userId });

    const intervalDays = eachDayOfInterval({
      start: parseISO(startDate as string),
      end: parseISO(endDate as string),
    }).map((d) => format(d, 'yyyy-MM-dd'));

    const summaries = intervalDays.map((dateStr) => computeDailySummary(sessions, dateStr, target, tz));

    sendSuccess(res, summaries);
  } catch (error) {
    next(error);
  }
};
