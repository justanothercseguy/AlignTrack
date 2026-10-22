import { Router } from 'express';
import { auth } from '../middleware/auth';
import * as reportController from '../controllers/reportController';

const router = Router();

// All routes require authentication
router.use(auth);

router.get('/visit-report', reportController.getVisitReport);
router.get('/treatment-summary', reportController.getTreatmentSummary);
router.get('/wear-time-report', reportController.getWearTimeReport);

export default router;
