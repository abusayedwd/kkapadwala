import express from 'express';
import taskController from '../../controllers/tasks.controller';

const router = express.Router();

router.route('/service').get(taskController.homeServiceList);

export default router;
