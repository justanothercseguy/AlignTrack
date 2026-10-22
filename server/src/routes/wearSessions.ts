import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  manualSessionValidators,
  editSessionValidators,
} from '../utils/validators';
import * as wearSessionController from '../controllers/wearSessionController';

const router = Router();

// All routes require authentication
router.use(auth);

// Specific routes MUST be defined before parameterized routes to avoid conflicts
router.post('/start', wearSessionController.startSession);
router.post('/stop', wearSessionController.stopSession);
router.get('/active', wearSessionController.getActiveSession);
router.post('/manual', manualSessionValidators, validate, wearSessionController.addManualSession);
router.get('/daily-summary', wearSessionController.getDailySummary);
router.get('/weekly-summary', wearSessionController.getWeeklySummary);
router.get('/summary', wearSessionController.getPeriodSummary);
router.get('/', wearSessionController.listSessions);

// Parameterized routes last
router.put('/:id', editSessionValidators, validate, wearSessionController.editSession);
router.delete('/:id', wearSessionController.deleteSession);

export default router;
