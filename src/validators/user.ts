import { body, param, query } from 'express-validator';
import { UserService } from '../services/user';

export const createUserValidation = (userService: UserService) => [
    body('username')
        .isString()
        .withMessage('Username must be a string')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .custom(async (username) => {
            const user = await userService.findUserByField('username', username);
            if (user) {
                throw new Error('Username is already taken');
            }
            return true;
        }),
];

export const createExerciseValidation = [
    param('_id').isInt().withMessage('User ID must be an integer'),
    body('description').isString().withMessage('Description must be a string').notEmpty().withMessage('Description is required'),
    body('duration').isInt().withMessage('Duration must be an integer').notEmpty().withMessage('Duration is required'),
    body('date').optional().isISO8601().withMessage('Date must be in YYYY-MM-DD format'),
];

export const getLogsValidation = [
    param('_id').isInt().withMessage('User ID must be an integer'),
    query('from').optional().isISO8601().withMessage('From must be a valid date in YYYY-MM-DD format'),
    query('to').optional().isISO8601().withMessage('To must be a valid date in YYYY-MM-DD format'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];
