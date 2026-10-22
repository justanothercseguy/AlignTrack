import { Router } from 'express';
import { auth } from '../middleware/auth';
import * as calendarController from '../controllers/calendarController';

const router = Router();

router.get('/events', auth, calendarController.getCalendarEvents);

export default router;
