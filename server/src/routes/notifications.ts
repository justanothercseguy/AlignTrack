import { Router } from 'express';
import { auth } from '../middleware/auth';
import * as notificationController from '../controllers/notificationController';

const router = Router();

// All routes require authentication
router.use(auth);

// Specific routes before parameterized routes
router.get('/', notificationController.listNotifications);
router.put('/read-all', notificationController.markAllRead);
router.post('/push-subscription', notificationController.registerPushSubscription);
router.delete('/push-subscription', notificationController.removePushSubscription);
router.get('/push-status', notificationController.getPushStatus);

// Parameterized routes
router.put('/:id/read', notificationController.markRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;
