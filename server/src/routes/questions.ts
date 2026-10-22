import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createQuestionValidators,
  updateQuestionValidators,
  completeQuestionValidators,
} from '../utils/validators';
import * as questionController from '../controllers/questionController';

const router = Router();

// All routes require authentication
router.use(auth);

// Specific routes before parameterized routes
router.get('/unanswered', questionController.getUnanswered);
router.get('/for-appointment/:appointmentId', questionController.getForAppointment);
router.get('/', questionController.listQuestions);
router.post('/', createQuestionValidators, validate, questionController.createQuestion);

// Parameterized routes
router.put('/:id', updateQuestionValidators, validate, questionController.updateQuestion);
router.put('/:id/complete', completeQuestionValidators, validate, questionController.completeQuestion);
router.delete('/:id', questionController.deleteQuestion);

export default router;
