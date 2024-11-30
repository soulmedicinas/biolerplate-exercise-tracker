import { Request, Response } from 'express';
import { UserService } from '../services/user';
import { errorResponse, StatusCodes, successResponse } from '../utils/response';

export class UserController {
    constructor(private readonly userService: UserService) {}

    createUser = async (req: Request, res: Response): Promise<Response> => {
        const { username } = req.body;

        try {
            const newUser = await this.userService.createUser(username);

            return successResponse(res, newUser, StatusCodes.Created);
        } catch (error) {
            return errorResponse(res, 'Failed to create user');
        }
    };

    getAllUsers = async (_: Request, res: Response): Promise<Response> => {
        try {
            const users = await this.userService.findAll();

            if (users.length === 0) {
                return errorResponse(res, 'No users found', StatusCodes.NotFound);
            }

            return successResponse(res, users);
        } catch (error) {
            return errorResponse(res, 'Failed to fetch users');
        }
    };

    createExercise = async (req: Request, res: Response): Promise<Response> => {
        const { _id } = req.params;
        const { description, duration, date } = req.body;

        try {
            const user = await this.userService.findUserById(Number(_id));

            if (!user) {
                return errorResponse(res, 'User not found', StatusCodes.NotFound);
            }

            const newExercise = await this.userService.createExercise(
                Number(_id),
                description,
                Number(duration),
                date || new Date().toISOString().split('T')[0],
            );

            return successResponse(
                res,
                {
                    userId: user.id,
                    exerciseId: newExercise.id,
                    description: newExercise.description,
                    duration: newExercise.duration,
                    date: newExercise.date,
                },
                StatusCodes.Created,
            );
        } catch (error) {
            return errorResponse(res, 'Failed to create exercise');
        }
    };

    getExerciseLogs = async (req: Request, res: Response): Promise<Response> => {
        const { _id } = req.params;
        const { from, to, limit } = req.query;

        try {
            const user = await this.userService.findUserById(Number(_id));
            if (!user) {
                return errorResponse(res, 'User not found', StatusCodes.NotFound);
            }

            const { exercises, totalLogsCount } = await this.userService.getExerciseLogs(
                Number(_id),
                from as string,
                to as string,
                limit ? Number(limit) : undefined,
            );

            const logs = exercises.map((exercise) => ({
                id: exercise.id,
                description: exercise.description,
                duration: exercise.duration,
                date: exercise.date,
            }));

            return successResponse(res, {
                id: user.id,
                username: user.username,
                logs,
                count: totalLogsCount,
            });
        } catch (error) {
            return errorResponse(res, 'Failed to retrieve exercise logs');
        }
    };
}
