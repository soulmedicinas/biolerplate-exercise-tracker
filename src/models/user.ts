import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/connection';

export interface UserAttributes {
    id: number;
    username: string;
}

export class User extends Model<UserAttributes, Omit<UserAttributes, 'id'>> implements UserAttributes {
    public id!: number;
    public username!: string;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: false,
    },
);
