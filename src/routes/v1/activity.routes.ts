import express from 'express';
import activityController from '../../controllers/activity.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.route('/').get(auth('common'), activityController.getActivitiesById);
router.route('/:id').delete(auth('common'), activityController.deleteActivityById);

export default router;
