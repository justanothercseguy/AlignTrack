import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import AlignerSet from '../models/AlignerSet';
import User from '../models/User';
import {
  calculatePlannedChangeDate,
  calculateDaysElapsed,
  calculateDaysRemaining,
  isSetOverdue,
  getPhaseDefaultsForSet,
  getEffectiveWearTarget,
  recalculateFutureSets,
} from '../services/dateCalculation';
import { sendSuccess } from '../utils/response';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';

export const listSets = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { status } = req.query;

    const filter: any = { userId };
    if (status) {
      filter.status = status;
    }

    const sets = await AlignerSet.find(filter).sort({ setNumber: 1 });

    const setsWithMeta = sets.map((set: any) => {
      const setObj = set.toObject ? set.toObject() : { ...set };
      const startDate = set.actualStartDate || set.plannedStartDate;
      const daysElapsed = startDate ? calculateDaysElapsed(startDate) : 0;
      const daysRemaining = set.plannedChangeDate ? calculateDaysRemaining(set.plannedChangeDate) : 0;
      const isOverdue = isSetOverdue(set.plannedChangeDate || '', set.status);

      return {
        ...setObj,
        daysElapsed,
        daysRemaining,
        isOverdue,
      };
    });

    sendSuccess(res, setsWithMeta);
  } catch (error) {
    next(error);
  }
};

export const getSet = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const set = await AlignerSet.findOne({ _id: id, userId });
    if (!set) {
      throw new NotFoundError('Aligner set not found');
    }

    const startDate = set.actualStartDate || set.plannedStartDate;
    const daysElapsed = startDate ? calculateDaysElapsed(startDate) : 0;
    const daysRemaining = set.plannedChangeDate ? calculateDaysRemaining(set.plannedChangeDate) : 0;
    const isOverdue = isSetOverdue(set.plannedChangeDate || '', set.status);

    sendSuccess(res, {
      ...set.toObject(),
      daysElapsed,
      daysRemaining,
      isOverdue,
    });
  } catch (error) {
    next(error);
  }
};

export const createSet = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      setNumber,
      label,
      plannedStartDate,
      plannedStartTime,
      actualStartDate,
      actualStartTime,
      plannedDurationDays,
      wearTimeTargetOverride,
      status,
      notes,
      reminderPreferences,
    } = req.body;

    const user = await User.findById(userId);
    const defaults = getPhaseDefaultsForSet(setNumber, user?.treatmentSettings);

    const duration = plannedDurationDays || defaults.defaultDurationDays;
    const startDate = plannedStartDate || actualStartDate;

    let plannedChangeDate = undefined;
    if (startDate) {
      plannedChangeDate = calculatePlannedChangeDate(startDate, duration);
    }

    // If marked current, ensure no other set is current
    if (status === 'current') {
      const existingSets = await AlignerSet.find({ userId });
      for (const s of existingSets) {
        if (s.status === 'current') {
          s.status = s.setNumber < setNumber ? 'completed' : 'planned';
          await s.save();
        }
      }
    }

    const set = await AlignerSet.create({
      userId,
      setNumber,
      label: label || `Set ${setNumber}`,
      plannedStartDate,
      plannedStartTime,
      actualStartDate,
      actualStartTime,
      plannedDurationDays: duration,
      plannedChangeDate,
      wearTimeTargetOverride: wearTimeTargetOverride !== undefined ? wearTimeTargetOverride : null,
      status: status || 'planned',
      notes: notes || '',
      reminderPreferences: reminderPreferences || {},
    });

    sendSuccess(res, set, 'Aligner set created', 201);
  } catch (error) {
    next(error);
  }
};

export const updateSet = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const {
      plannedDurationDays,
      plannedStartDate,
      plannedStartTime,
      plannedChangeDate,
      plannedChangeTime,
      actualStartDate,
      actualStartTime,
      actualChangeDate,
      actualChangeTime,
      wearTimeTargetOverride,
      status,
      notes,
      reminderPreferences,
      recalculateFuture,
    } = req.body;

    const set = await AlignerSet.findOne({ _id: id, userId });
    if (!set) {
      throw new NotFoundError('Aligner set not found');
    }

    if (plannedDurationDays !== undefined) set.plannedDurationDays = plannedDurationDays;
    if (plannedStartDate !== undefined) set.plannedStartDate = plannedStartDate;
    if (plannedStartTime !== undefined) set.plannedStartTime = plannedStartTime;
    if (actualStartDate !== undefined) set.actualStartDate = actualStartDate;
    if (actualStartTime !== undefined) set.actualStartTime = actualStartTime;
    if (actualChangeDate !== undefined) set.actualChangeDate = actualChangeDate;
    if (actualChangeTime !== undefined) set.actualChangeTime = actualChangeTime;
    if (plannedChangeTime !== undefined) set.plannedChangeTime = plannedChangeTime;
    if (wearTimeTargetOverride !== undefined) set.wearTimeTargetOverride = wearTimeTargetOverride;
    if (notes !== undefined) set.notes = notes;
    if (reminderPreferences !== undefined) set.reminderPreferences = reminderPreferences;

    // Handle status changes cleanly
    if (status !== undefined) {
      set.status = status;
      if (status === 'current') {
        const otherSets = await AlignerSet.find({ userId, _id: { $ne: id } });
        for (const other of otherSets) {
          if (other.status === 'current') {
            other.status = other.setNumber < set.setNumber ? 'completed' : 'planned';
            await other.save();
          }
        }
      }
    }

    // Recalculate planned change date if duration or start date changed
    if (plannedChangeDate !== undefined) {
      set.plannedChangeDate = plannedChangeDate;
    } else if (set.plannedStartDate || set.actualStartDate) {
      const baseStart = set.actualStartDate || set.plannedStartDate;
      if (baseStart) {
        set.plannedChangeDate = calculatePlannedChangeDate(baseStart, set.plannedDurationDays);
      }
    }

    await set.save();

    // Optionally recalculate future sets
    if (recalculateFuture) {
      await recalculateFutureSets(userId!, set.setNumber);
    }

    sendSuccess(res, set, 'Aligner set updated');
  } catch (error) {
    next(error);
  }
};

export const deleteSet = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const set = await AlignerSet.findOneAndDelete({ _id: id, userId });
    if (!set) {
      throw new NotFoundError('Aligner set not found');
    }

    sendSuccess(res, null, 'Aligner set deleted');
  } catch (error) {
    next(error);
  }
};

export const confirmChange = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const {
      actualChangeDate,
      actualChangeTime,
      nextSetNumber,
      nextSetPlannedDuration,
      nextSetActualStartDate,
      nextSetActualStartTime,
    } = req.body;

    const currentSet = await AlignerSet.findOne({ _id: id, userId });
    if (!currentSet) {
      throw new NotFoundError('Aligner set not found');
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const isFutureChange = actualChangeDate > todayStr;

    const user = await User.findById(userId);
    const targetNextNum = nextSetNumber || currentSet.setNumber + 1;
    let nextSet = await AlignerSet.findOne({ userId, setNumber: targetNextNum });

    const nextStartDate = nextSetActualStartDate || actualChangeDate;
    const switchTime = actualChangeTime || nextSetActualStartTime;
    const defaults = getPhaseDefaultsForSet(targetNextNum, user?.treatmentSettings);
    const nextDuration = nextSetPlannedDuration || nextSet?.plannedDurationDays || defaults.defaultDurationDays;
    const nextPlannedChange = calculatePlannedChangeDate(nextStartDate, nextDuration);

    if (isFutureChange) {
      // 1. Future date: The user is planning/scheduling the switch for a future date (e.g. Oct 24)
      // Current set remains active/current until that date!
      currentSet.plannedChangeDate = actualChangeDate;
      if (switchTime) {
        currentSet.plannedChangeTime = switchTime;
      }
      const baseStart = currentSet.actualStartDate || currentSet.plannedStartDate;
      if (baseStart) {
        currentSet.plannedDurationDays = Math.max(1, differenceInCalendarDays(parseISO(actualChangeDate), parseISO(baseStart)));
      }
      currentSet.status = 'current';
      await currentSet.save();

      // 2. Next set is in 'planned' status to start on actualChangeDate
      if (nextSet) {
        nextSet.plannedStartDate = nextStartDate;
        if (switchTime) nextSet.plannedStartTime = switchTime;
        nextSet.actualStartDate = undefined; // Has not physically started yet!
        nextSet.actualStartTime = undefined;
        nextSet.plannedDurationDays = nextDuration;
        nextSet.plannedChangeDate = nextPlannedChange;
        nextSet.status = 'planned';
        await nextSet.save();
      } else {
        nextSet = await AlignerSet.create({
          userId,
          setNumber: targetNextNum,
          label: `Set ${targetNextNum}`,
          plannedStartDate: nextStartDate,
          plannedStartTime: switchTime,
          plannedDurationDays: nextDuration,
          plannedChangeDate: nextPlannedChange,
          status: 'planned',
        });
      }
    } else {
      // Date is today or in the past: Confirmed physical change has occurred!
      currentSet.actualChangeDate = actualChangeDate;
      if (switchTime) currentSet.actualChangeTime = switchTime;
      currentSet.status = 'completed';
      await currentSet.save();

      if (nextSet) {
        nextSet.actualStartDate = nextStartDate;
        if (switchTime) nextSet.actualStartTime = switchTime;
        nextSet.plannedStartDate = nextStartDate;
        if (switchTime) nextSet.plannedStartTime = switchTime;
        nextSet.plannedDurationDays = nextDuration;
        nextSet.plannedChangeDate = nextPlannedChange;
        nextSet.status = 'current';
        await nextSet.save();
      } else {
        nextSet = await AlignerSet.create({
          userId,
          setNumber: targetNextNum,
          label: `Set ${targetNextNum}`,
          plannedStartDate: nextStartDate,
          plannedStartTime: switchTime,
          actualStartDate: nextStartDate,
          actualStartTime: switchTime,
          plannedDurationDays: nextDuration,
          plannedChangeDate: nextPlannedChange,
          status: 'current',
        });
      }
    }

    // 3. Recalculate future sets based on the change
    await recalculateFutureSets(userId!, targetNextNum);

    sendSuccess(res, {
      completedSet: currentSet,
      nextSet,
      isFutureChange,
    }, isFutureChange ? `Set ${currentSet.setNumber} extended to ${actualChangeDate}. Set ${targetNextNum} scheduled.` : 'Aligner switch confirmed successfully');
  } catch (error) {
    next(error);
  }
};

export const generatePlan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { startDate, totalSets } = req.body;

    const user = await User.findById(userId);
    let runningDate = startDate;
    const createdSets = [];

    for (let setNum = 1; setNum <= totalSets; setNum++) {
      const defaults = getPhaseDefaultsForSet(setNum, user?.treatmentSettings);
      const duration = defaults.defaultDurationDays;
      const plannedChangeDate = calculatePlannedChangeDate(runningDate, duration);

      const existing = await AlignerSet.findOne({ userId, setNumber: setNum });
      if (!existing) {
        const newSet = await AlignerSet.create({
          userId,
          setNumber: setNum,
          label: `Set ${setNum}`,
          plannedStartDate: runningDate,
          actualStartDate: setNum === 1 ? runningDate : undefined,
          plannedDurationDays: duration,
          plannedChangeDate,
          status: setNum === 1 ? 'current' : 'planned',
        });
        createdSets.push(newSet);
      }

      runningDate = plannedChangeDate;
    }

    sendSuccess(res, createdSets, `Plan generated with ${createdSets.length} sets`, 201);
  } catch (error) {
    next(error);
  }
};

export const recalculate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const set = await AlignerSet.findOne({ _id: id, userId });
    if (!set) {
      throw new NotFoundError('Aligner set not found');
    }

    const updated = await recalculateFutureSets(userId!, set.setNumber);
    sendSuccess(res, updated, 'Future sets recalculated successfully');
  } catch (error) {
    next(error);
  }
};
