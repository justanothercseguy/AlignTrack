import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import Appointment from '../models/Appointment';
import Notification from '../models/Notification';
import Question from '../models/Question';
import JournalEntry from '../models/JournalEntry';
import User from '../models/User';
import { sendSuccess } from '../utils/response';
import { NotFoundError } from '../utils/errors';

export const listAppointments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { status, sort = 'date' } = req.query;

    const filter: any = { userId };
    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .sort(sort === '-date' ? { date: -1, time: -1 } : { date: 1, time: 1 })
      .populate('issuesToDiscuss');

    sendSuccess(res, appointments);
  } catch (error) {
    next(error);
  }
};

export const getAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const appointment = await Appointment.findOne({ _id: id, userId }).populate('issuesToDiscuss');
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    const linkedQuestions = await Question.find({ appointmentId: id });

    sendSuccess(res, {
      ...appointment.toObject(),
      linkedQuestions,
    });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      title,
      provider,
      date,
      time,
      timezone,
      location,
      notes,
      questionsToAsk,
      issuesToDiscuss,
      reminderConfig,
    } = req.body;

    const user = await User.findById(userId);
    const tz = timezone || user?.timezone || 'Asia/Kolkata';

    const appointment = await Appointment.create({
      userId,
      title,
      provider: provider || '',
      date,
      time: time || '',
      timezone: tz,
      location: location || '',
      notes: notes || '',
      questionsToAsk: questionsToAsk || [],
      issuesToDiscuss: issuesToDiscuss || [],
      reminderConfig: reminderConfig || {
        oneDayBefore: true,
        dayOf: false,
        reminderTime: '09:00',
      },
      status: 'upcoming',
    });

    sendSuccess(res, appointment, 'Appointment scheduled', 201);
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const updates = req.body;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    sendSuccess(res, appointment, 'Appointment updated');
  } catch (error) {
    next(error);
  }
};

export const rescheduleAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { date, time, reason } = req.body;

    const appointment = await Appointment.findOne({ _id: id, userId });
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    // Invalidate/delete old notifications for this appointment
    await Notification.deleteMany({
      userId,
      relatedModel: 'Appointment',
      relatedId: appointment._id,
      deliveryStatus: 'pending',
    });

    appointment.date = date;
    if (time !== undefined) appointment.time = time;
    appointment.status = 'upcoming';
    if (reason) {
      appointment.notes = appointment.notes
        ? `${appointment.notes}\n[Rescheduled: ${reason}]`
        : `[Rescheduled: ${reason}]`;
    }

    await appointment.save();

    sendSuccess(res, appointment, 'Appointment rescheduled successfully');
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const appointment = await Appointment.findOne({ _id: id, userId });
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // Cancel pending reminders
    await Notification.deleteMany({
      userId,
      relatedModel: 'Appointment',
      relatedId: appointment._id,
      deliveryStatus: 'pending',
    });

    sendSuccess(res, appointment, 'Appointment cancelled');
  } catch (error) {
    next(error);
  }
};

export const completeAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { postAppointmentNotes } = req.body;

    const appointment = await Appointment.findOne({ _id: id, userId });
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    appointment.status = 'completed';
    if (postAppointmentNotes) {
      appointment.postAppointmentNotes = postAppointmentNotes;
    }
    await appointment.save();

    sendSuccess(res, appointment, 'Appointment marked completed');
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const appointment = await Appointment.findOneAndDelete({ _id: id, userId });
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    // Clean up notifications
    await Notification.deleteMany({
      userId,
      relatedModel: 'Appointment',
      relatedId: id,
    });

    sendSuccess(res, null, 'Appointment deleted');
  } catch (error) {
    next(error);
  }
};
