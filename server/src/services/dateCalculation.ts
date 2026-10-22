import { addDays, parseISO, format, differenceInCalendarDays, isAfter, isBefore } from 'date-fns';
import { TreatmentSettings, IAlignerSet } from '../types';
import AlignerSet from '../models/AlignerSet';

/**
 * Calculates planned change date by adding prescribed duration days to start date.
 * Start date + durationDays = plannedChangeDate
 * e.g., Oct 24 + 10 days = Nov 3
 */
export const calculatePlannedChangeDate = (startDate: string, durationDays: number): string => {
  if (!startDate) {
    throw new Error('Start date is required to calculate planned change date');
  }
  if (!durationDays || durationDays <= 0) {
    throw new Error('Valid duration in days is required');
  }
  const parsed = parseISO(startDate);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format: ${startDate}. Expected YYYY-MM-DD.`);
  }
  const result = addDays(parsed, durationDays);
  return format(result, 'yyyy-MM-dd');
};

/**
 * Calculates calendar days elapsed since start date until today (or a reference date).
 */
export const calculateDaysElapsed = (startDate: string, referenceDate?: string): number => {
  if (!startDate) return 0;
  const start = parseISO(startDate);
  const end = referenceDate ? parseISO(referenceDate) : new Date();
  const diff = differenceInCalendarDays(end, start);
  return diff < 0 ? 0 : diff + 1;
};

/**
 * Calculates remaining days until planned change date.
 * Negative value indicates overdue.
 */
export const calculateDaysRemaining = (plannedChangeDate: string, referenceDate?: string): number => {
  if (!plannedChangeDate) return 0;
  const target = parseISO(plannedChangeDate);
  const today = referenceDate ? parseISO(referenceDate) : new Date();
  return differenceInCalendarDays(target, today);
};

/**
 * Checks if an aligner set is overdue.
 */
export const isSetOverdue = (plannedChangeDate: string, status: string, referenceDate?: string): boolean => {
  if (status !== 'current' || !plannedChangeDate) return false;
  const target = parseISO(plannedChangeDate);
  const today = referenceDate ? parseISO(referenceDate) : new Date();
  return differenceInCalendarDays(today, target) > 0;
};

/**
 * Gets default duration and wear-time target for a set based on user's phase rules.
 */
export const getPhaseDefaultsForSet = (
  setNumber: number,
  settings?: TreatmentSettings
): { defaultDurationDays: number; defaultWearTimeTarget: number } => {
  const defaultPhases = [
    { name: 'Phase A', startSet: 1, endSet: 5, defaultDurationDays: 10, defaultWearTimeTarget: 18 },
    { name: 'Phase B', startSet: 6, endSet: undefined, defaultDurationDays: 7, defaultWearTimeTarget: 20 },
  ];

  const phases = settings?.phases && settings.phases.length > 0 ? settings.phases : defaultPhases;

  for (const phase of phases) {
    const isAboveStart = setNumber >= phase.startSet;
    const isBelowEnd = !phase.endSet || setNumber <= phase.endSet;
    if (isAboveStart && isBelowEnd) {
      return {
        defaultDurationDays: phase.defaultDurationDays,
        defaultWearTimeTarget: phase.defaultWearTimeTarget,
      };
    }
  }

  // Fallback defaults
  if (setNumber <= 5) {
    return { defaultDurationDays: 10, defaultWearTimeTarget: 18 };
  }
  return { defaultDurationDays: 7, defaultWearTimeTarget: 20 };
};

/**
 * Gets effective wear time target for a set, considering set-level override.
 */
export const getEffectiveWearTarget = (
  setNumber: number,
  settings?: TreatmentSettings,
  setOverride?: number | null
): number => {
  if (setOverride !== null && setOverride !== undefined && setOverride > 0) {
    return setOverride;
  }
  return getPhaseDefaultsForSet(setNumber, settings).defaultWearTimeTarget;
};

/**
 * Recalculates future planned sets from a specific set onwards.
 * Does NOT modify actual dates of completed or current sets.
 */
export const recalculateFutureSets = async (
  userId: string,
  fromSetNumber: number
): Promise<IAlignerSet[]> => {
  const allSets = await AlignerSet.find({ userId }).sort({ setNumber: 1 });
  if (allSets.length === 0) return [];

  const updatedSets: IAlignerSet[] = [];

  for (let i = 0; i < allSets.length; i++) {
    const current = allSets[i];

    if (current.setNumber <= fromSetNumber) {
      continue;
    }

    // Only update planned sets or recalculate planned dates for future sets
    if (current.status === 'completed') {
      // Never overwrite confirmed history
      continue;
    }

    const previous = allSets[i - 1];
    if (!previous) continue;

    // Determine baseline start date from previous set
    // If previous set has actualChangeDate, use that; otherwise use previous set's plannedChangeDate
    let baselineStartDate: string | undefined = undefined;
    if (previous.actualChangeDate) {
      baselineStartDate = previous.actualChangeDate;
    } else if (previous.plannedChangeDate) {
      baselineStartDate = previous.plannedChangeDate;
    }

    if (baselineStartDate) {
      current.plannedStartDate = baselineStartDate;
      current.plannedChangeDate = calculatePlannedChangeDate(
        baselineStartDate,
        current.plannedDurationDays
      );
      await current.save();
      updatedSets.push(current);
    }
  }

  return updatedSets;
};
