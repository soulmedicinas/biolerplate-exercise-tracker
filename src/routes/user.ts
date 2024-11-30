import { Router } from 'express';
import { UserController } from '../controllers/user';
import { validateRequest } from '../middlewares/validator';
import { createExerciseValidation, createUserValidation, getLogsValidation } from '../validators/user';
import { UserService } from '../services/user';

export const userRouter = Router();

const userService = new UserService();
const userController = new UserController(userService);

userRouter
    .get('/api/users', userController.getAllUsers)
    .get('/api/users/:_id/logs', validateRequest(getLogsValidation), userController.getExerciseLogs)
    .post('/api/users', validateRequest(createUserValidation(userService)), userController.createUser)
    .post('/api/users/:_id/exercises', validateRequest(createExerciseValidation), userController.createExercise);
