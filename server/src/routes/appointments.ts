import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createAppointmentValidators,
  updateAppointmentValidators,
  rescheduleValidators,
} from '../utils/validators';
import * as appointmentController from '../controllers/appointmentController';

const router = Router();

// All routes require authentication
router.use(auth);

router.get('/', appointmentController.listAppointments);
router.post('/', createAppointmentValidators, validate, appointmentController.createAppointment);
router.get('/:id', appointmentController.getAppointment);
router.put('/:id', updateAppointmentValidators, validate, appointmentController.updateAppointment);
router.put('/:id/reschedule', rescheduleValidators, validate, appointmentController.rescheduleAppointment);
router.put('/:id/cancel', appointmentController.cancelAppointment);
router.put('/:id/complete', appointmentController.completeAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

export default router;
