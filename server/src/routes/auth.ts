import { Router } from 'express';
import { auth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import {
  registerValidators,
  loginValidators,
  updateProfileValidators,
  changePasswordValidators,
} from '../utils/validators';
import * as authController from '../controllers/authController';

const router = Router();

// Public routes (no auth required)
router.post('/register', authLimiter, registerValidators, validate, authController.register);
router.post('/login', authLimiter, loginValidators, validate, authController.login);

// Protected routes
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, updateProfileValidators, validate, authController.updateProfile);
router.post('/change-password', auth, changePasswordValidators, validate, authController.changePassword);
router.delete('/account', auth, authController.deleteAccount);

export default router;
