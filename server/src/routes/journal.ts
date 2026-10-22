import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createJournalValidators,
  updateJournalValidators,
} from '../utils/validators';
import * as journalController from '../controllers/journalController';

const router = Router();

// All routes require authentication
router.use(auth);

router.get('/', journalController.listEntries);
router.post('/', createJournalValidators, validate, journalController.createEntry);
router.get('/:id', journalController.getEntry);
router.put('/:id', updateJournalValidators, validate, journalController.updateEntry);
router.delete('/:id', journalController.deleteEntry);
router.put('/:id/resolve', journalController.resolveEntry);

export default router;
