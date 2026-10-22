import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import Question from '../models/Question';
import { sendSuccess } from '../utils/response';
import { NotFoundError } from '../utils/errors';

export const listQuestions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { isCompleted, appointmentId, priority } = req.query;

    const filter: any = { userId };
    if (isCompleted !== undefined) {
      filter.isCompleted = isCompleted === 'true';
    }
    if (appointmentId) {
      filter.appointmentId = appointmentId;
    }
    if (priority) {
      filter.priority = priority;
    }

    const questions = await Question.find(filter).sort({ priority: -1, createdAt: -1 });

    sendSuccess(res, questions);
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { text, priority, alignerSetId, journalEntryId, appointmentId } = req.body;

    const question = await Question.create({
      userId,
      text,
      priority: priority || 'medium',
      alignerSetId: alignerSetId || null,
      journalEntryId: journalEntryId || null,
      appointmentId: appointmentId || null,
      isCompleted: false,
    });

    sendSuccess(res, question, 'Question added', 201);
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const updates = req.body;

    const question = await Question.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!question) {
      throw new NotFoundError('Question not found');
    }

    sendSuccess(res, question, 'Question updated');
  } catch (error) {
    next(error);
  }
};

export const completeQuestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { answerNotes } = req.body;

    const question = await Question.findOne({ _id: id, userId });
    if (!question) {
      throw new NotFoundError('Question not found');
    }

    question.isCompleted = true;
    if (answerNotes !== undefined) {
      question.answerNotes = answerNotes;
    }
    await question.save();

    sendSuccess(res, question, 'Question marked completed');
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const question = await Question.findOneAndDelete({ _id: id, userId });
    if (!question) {
      throw new NotFoundError('Question not found');
    }

    sendSuccess(res, null, 'Question deleted');
  } catch (error) {
    next(error);
  }
};

export const getForAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { appointmentId } = req.params;

    const questions = await Question.find({ userId, appointmentId }).sort({ priority: -1 });
    sendSuccess(res, questions);
  } catch (error) {
    next(error);
  }
};

export const getUnanswered = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const questions = await Question.find({ userId, isCompleted: false }).sort({ priority: -1, createdAt: -1 });
    sendSuccess(res, questions);
  } catch (error) {
    next(error);
  }
};
