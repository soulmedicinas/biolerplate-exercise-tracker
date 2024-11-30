import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';

interface ExerciseAttributes {
    id: number;
    userId: number;
    description: string;
    duration: number;
    date: string;
}

type ExerciseCreationAttributes = Optional<Omit<ExerciseAttributes, 'id'>, 'date'>;

export class Exercise extends Model<ExerciseAttributes, ExerciseCreationAttributes> implements ExerciseAttributes {
    public id!: number;
    public userId!: number;
    public description!: string;
    public duration!: number;
    public date!: string;
}

Exercise.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'exercises',
    },
);
