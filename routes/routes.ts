import { Router } from 'express';
import { createUser, getUsers } from '../controllers/userController';
import { createExercise } from '../controllers/exercisesController';

const router = Router();

router.post('/users', createUser as any);
router.get('/users', getUsers as any);

router.post('/users/:_id/exercises', createExercise as any);

export default router;
