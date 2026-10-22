import { startOfDay, endOfDay, parseISO, isAfter, isBefore, max, min, differenceInMinutes } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { DailyWearSummary, IWearSession } from '../types';
import WearSession from '../models/WearSession';

export interface Interval {
  start: Date;
  end: Date;
}

/**
 * Merges overlapping or adjacent intervals to prevent double-counting.
 */
export const mergeIntervals = (intervals: Interval[]): Interval[] => {
  if (intervals.length <= 1) return intervals;

  // Sort by start time
  const sorted = [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: Interval[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.start.getTime() <= last.end.getTime()) {
      // Overlap or touch: merge by taking max end time
      last.end = new Date(Math.max(last.end.getTime(), current.end.getTime()));
    } else {
      merged.push(current);
    }
  }

  return merged;
};

/**
 * Calculates wear minutes for a specific calendar day in a given timezone.
 * Handles sessions that cross midnight by clipping to [dayStart, dayEnd].
 */
export const calculateDailyWearMinutes = (
  sessions: Array<{ startTime: Date; endTime?: Date | null; isActive?: boolean }>,
  targetDateStr: string, // YYYY-MM-DD
  timezone: string = 'Asia/Kolkata',
  currentTime: Date = new Date()
): { totalMinutes: number; sessionBreakdown: Array<{ startTime: Date; endTime: Date; durationMinutes: number }> } => {
  // Construct start and end of target day in target timezone
  // Day starts at YYYY-MM-DDT00:00:00.000 in local timezone
  // Day ends at YYYY-MM-DDT23:59:59.999 in local timezone
  const localDayStart = fromZonedTime(`${targetDateStr}T00:00:00.000`, timezone);
  const localDayEnd = fromZonedTime(`${targetDateStr}T23:59:59.999`, timezone);

  const rawIntervals: Interval[] = [];
  const sessionBreakdown: Array<{ startTime: Date; endTime: Date; durationMinutes: number }> = [];

  for (const session of sessions) {
    const sessionStart = new Date(session.startTime);
    const sessionEnd = session.endTime ? new Date(session.endTime) : (session.isActive ? currentTime : new Date(session.startTime));

    // Validate interval
    if (sessionEnd.getTime() < sessionStart.getTime()) {
      continue; // Skip invalid intervals where removal is before insertion
    }

    // Clip interval to the boundaries of the target calendar day
    const clippedStart = sessionStart.getTime() < localDayStart.getTime() ? localDayStart : sessionStart;
    const clippedEnd = sessionEnd.getTime() > localDayEnd.getTime() ? localDayEnd : sessionEnd;

    // Check if there is an overlap with target day
    if (clippedEnd.getTime() > clippedStart.getTime()) {
      rawIntervals.push({ start: clippedStart, end: clippedEnd });
    }
  }

  // Merge overlapping intervals
  const merged = mergeIntervals(rawIntervals);

  let totalMinutes = 0;
  for (const item of merged) {
    const mins = Math.round((item.end.getTime() - item.start.getTime()) / (1000 * 60));
    totalMinutes += mins;
    sessionBreakdown.push({
      startTime: item.start,
      endTime: item.end,
      durationMinutes: mins,
    });
  }

  return { totalMinutes, sessionBreakdown };
};

/**
 * Computes the complete daily wear summary object.
 */
export const computeDailySummary = (
  sessions: IWearSession[],
  dateStr: string,
  targetHours: number,
  timezone: string = 'Asia/Kolkata'
): DailyWearSummary => {
  const { totalMinutes, sessionBreakdown } = calculateDailyWearMinutes(sessions, dateStr, timezone);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const remainingHours = Math.max(0, Math.round((targetHours - totalHours) * 10) / 10);
  const extraHours = Math.max(0, Math.round((totalHours - targetHours) * 10) / 10);
  const targetMet = totalHours >= targetHours;

  return {
    date: dateStr,
    totalMinutes,
    totalHours,
    targetHours,
    remainingHours,
    extraHours,
    targetMet,
    sessions: sessionBreakdown.map((s) => ({
      startTime: s.startTime,
      endTime: s.endTime,
      durationMinutes: s.durationMinutes,
    })),
  };
};

/**
 * Checks for duplicate or overlapping sessions when saving a new or updated session.
 */
export const hasOverlappingSession = async (
  userId: string,
  startTime: Date | string,
  endTime: Date | string | null,
  excludeSessionId?: string
): Promise<boolean> => {
  const query: any = {
    userId,
  };

  if (excludeSessionId) {
    query._id = { $ne: excludeSessionId };
  }

  const existingSessions = await WearSession.find(query);

  const startMs = new Date(startTime).getTime();
  const effectiveEndMs = endTime ? new Date(endTime).getTime() : new Date().getTime();

  for (const session of existingSessions) {
    const existingStartMs = new Date(session.startTime).getTime();
    const existingEndMs = session.endTime
      ? new Date(session.endTime).getTime()
      : session.isActive
      ? new Date().getTime()
      : existingStartMs;

    // Two intervals [A, B] and [C, D] overlap if max(A, C) < min(B, D)
    const overlapStart = Math.max(startMs, existingStartMs);
    const overlapEnd = Math.min(effectiveEndMs, existingEndMs);

    if (overlapStart < overlapEnd) {
      return true;
    }
  }

  return false;
};
