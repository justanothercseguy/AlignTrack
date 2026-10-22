import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  settingsTreatmentValidators,
  settingsNotificationValidators,
} from '../utils/validators';
import * as settingsController from '../controllers/settingsController';

const router = Router();

// All routes require authentication
router.use(auth);

router.get('/', settingsController.getSettings);
router.put('/treatment', settingsTreatmentValidators, validate, settingsController.updateTreatmentSettings);
router.put('/notifications', settingsNotificationValidators, validate, settingsController.updateNotificationPreferences);
router.put('/wear-time', settingsController.updateWearTimeSettings);
router.post('/export', settingsController.exportData);

export default router;
