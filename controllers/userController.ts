import { Request, Response } from 'express';
import { getDB } from '../src/initDb';
import { CustomError } from '../types';

const db = getDB();

export const createUser = async (req: Request, res: Response) => {
  const { username } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({
      message: 'No username provided!',
    });
  }

  let transformedUserName = username.trim();

  try {
    const result = await db.run('INSERT INTO Users (username) VALUES (?)', transformedUserName);
    const createdUserId = result.lastID;

    return res.status(201).json({
      message: 'User created',
      user: {
        id: createdUserId,
        username: transformedUserName,
      },
    });
  } catch (err) {
    const error = err as CustomError;

    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({
        message: `User with username: ${username} already exits!`,
      });
    }

    return res.status(500).json({
      message: 'Something went wrong. Please try again later',
    });
  }
};

export const getUsers = async (_: Request, res: Response) => {
  try {
    const users = await db.all('SELECT * FROM Users');

    return res.status(200).json({
      message: 'Users fetched successfully.',
      users: users,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Something went wrong. Please try again later',
    });
  }
};
