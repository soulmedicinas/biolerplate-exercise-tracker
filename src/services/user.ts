import { User } from '../models/user';
import { Exercise } from '../models/exercise';
import { Op } from 'sequelize';

export class UserService {
    async createUser(username: string) {
        return await User.create({ username });
    }

    async findUserById(id: number) {
        return await User.findByPk(id);
    }

    public async findUserByField(field: string, value: string) {
        return await User.findOne({ where: { [field]: value } });
    }

    async findAll() {
        return await User.findAll();
    }

    async createExercise(userId: number, description: string, duration: number, date: string) {
        return await Exercise.create({
            userId,
            description,
            duration,
            date,
        });
    }

    async getExerciseLogs(userId: number, from?: string, to?: string, limit?: number) {
        const filters: { [key: string]: any } = { userId };

        if (from || to) {
            filters.date = {};
            if (from) {
                filters.date[Op.gte] = from;
            }
            if (to) {
                filters.date[Op.lte] = to;
            }
        }

        const totalLogsCount = await Exercise.count({ where: filters });

        const exercises = await Exercise.findAll({
            where: filters,
            limit,
            order: [['date', 'ASC']],
        });

        return { exercises, totalLogsCount };
    }
}
