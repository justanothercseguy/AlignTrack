import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createSetValidators,
  updateSetValidators,
  confirmChangeValidators,
  generatePlanValidators,
} from '../utils/validators';
import * as alignerSetController from '../controllers/alignerSetController';

const router = Router();

// All routes require authentication
router.use(auth);

router.get('/', alignerSetController.listSets);
router.post('/', createSetValidators, validate, alignerSetController.createSet);
router.post('/generate-plan', generatePlanValidators, validate, alignerSetController.generatePlan);
router.get('/:id', alignerSetController.getSet);
router.put('/:id', updateSetValidators, validate, alignerSetController.updateSet);
router.delete('/:id', alignerSetController.deleteSet);
router.post('/:id/confirm-change', confirmChangeValidators, validate, alignerSetController.confirmChange);
router.put('/:id/recalculate', alignerSetController.recalculate);

export default router;
