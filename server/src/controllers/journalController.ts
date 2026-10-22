import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import JournalEntry from '../models/JournalEntry';
import { sendSuccess } from '../utils/response';
import { NotFoundError } from '../utils/errors';

export const listEntries = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      alignerSetId,
      category,
      severity,
      unresolved,
      needsDiscussion,
      search,
      startDate,
      endDate,
    } = req.query;

    const filter: any = { userId };

    if (alignerSetId) filter.alignerSetId = alignerSetId;
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (unresolved === 'true') filter.isOngoing = true;
    if (needsDiscussion === 'true') filter.needsDiscussion = true;

    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.date = { $gte: startDate };
    } else if (endDate) {
      filter.date = { $lte: endDate };
    }

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { affectedArea: { $regex: search, $options: 'i' } },
      ];
    }

    const entries = await JournalEntry.find(filter).sort({ date: -1, createdAt: -1 });

    sendSuccess(res, entries);
  } catch (error) {
    next(error);
  }
};

export const getEntry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const entry = await JournalEntry.findOne({ _id: id, userId });
    if (!entry) {
      throw new NotFoundError('Journal entry not found');
    }

    sendSuccess(res, entry);
  } catch (error) {
    next(error);
  }
};

export const createEntry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      alignerSetId,
      appointmentId,
      date,
      time,
      category,
      severity,
      affectedArea,
      description,
      startDate,
      isOngoing,
      needsDiscussion,
      attachments,
    } = req.body;

    const entry = await JournalEntry.create({
      userId,
      alignerSetId: alignerSetId || null,
      appointmentId: appointmentId || null,
      date,
      time: time || '',
      category,
      severity: severity || 'Mild',
      affectedArea: affectedArea || '',
      description,
      startDate: startDate || date,
      isOngoing: isOngoing !== undefined ? isOngoing : true,
      needsDiscussion: needsDiscussion !== undefined ? needsDiscussion : false,
      attachments: attachments || [],
    });

    sendSuccess(res, entry, 'Journal entry recorded', 201);
  } catch (error) {
    next(error);
  }
};

export const updateEntry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const updates = req.body;

    const entry = await JournalEntry.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!entry) {
      throw new NotFoundError('Journal entry not found');
    }

    sendSuccess(res, entry, 'Journal entry updated');
  } catch (error) {
    next(error);
  }
};

export const deleteEntry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const entry = await JournalEntry.findOneAndDelete({ _id: id, userId });
    if (!entry) {
      throw new NotFoundError('Journal entry not found');
    }

    sendSuccess(res, null, 'Journal entry deleted');
  } catch (error) {
    next(error);
  }
};

export const resolveEntry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { resolutionDate } = req.body;

    const entry = await JournalEntry.findOne({ _id: id, userId });
    if (!entry) {
      throw new NotFoundError('Journal entry not found');
    }

    entry.isOngoing = false;
    entry.resolutionDate = resolutionDate || new Date().toISOString().split('T')[0];
    await entry.save();

    sendSuccess(res, entry, 'Issue marked as resolved');
  } catch (error) {
    next(error);
  }
};
