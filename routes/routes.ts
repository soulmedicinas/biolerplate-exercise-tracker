import { Router } from 'express';
import { createUser, getUsers } from '../controllers/userController';

const router = Router();

router.post('/users', createUser as any);
router.get('/users', getUsers as any);

export default router;
