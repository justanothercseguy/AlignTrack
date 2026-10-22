import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import AlignerSet from '../models/AlignerSet';
import WearSession from '../models/WearSession';
import Appointment from '../models/Appointment';
import JournalEntry from '../models/JournalEntry';
import Question from '../models/Question';
import Notification from '../models/Notification';
import PushSubscription from '../models/PushSubscription';
import env from '../config/env';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/errors';

const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ id: userId, email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, displayName, timezone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email is already registered');
    }

    const user = await User.create({
      email,
      password,
      displayName: displayName || '',
      timezone: timezone || 'Asia/Kolkata',
    });

    const token = generateToken(user._id.toString(), user.email);

    sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          timezone: user.timezone,
          notificationPreferences: user.notificationPreferences,
          treatmentSettings: user.treatmentSettings,
        },
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken(user._id.toString(), user.email);

    sendSuccess(res, {
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        timezone: user.timezone,
        notificationPreferences: user.notificationPreferences,
        treatmentSettings: user.treatmentSettings,
      },
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { displayName, timezone } = req.body;
    const user = await User.findById(req.user?.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (displayName !== undefined) user.displayName = displayName;
    if (timezone !== undefined) user.timezone = timezone;

    await user.save();

    sendSuccess(res, {
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        timezone: user.timezone,
        notificationPreferences: user.notificationPreferences,
        treatmentSettings: user.treatmentSettings,
      },
    }, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new BadRequestError('Current password does not match');
    }

    user.password = newPassword;
    await user.save();

    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError();
    }

    // Cascade delete all user records
    await Promise.all([
      User.findByIdAndDelete(userId),
      AlignerSet.deleteMany({ userId }),
      WearSession.deleteMany({ userId }),
      Appointment.deleteMany({ userId }),
      JournalEntry.deleteMany({ userId }),
      Question.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      PushSubscription.deleteMany({ userId }),
    ]);

    sendSuccess(res, null, 'Account and all associated data permanently deleted');
  } catch (error) {
    next(error);
  }
};
