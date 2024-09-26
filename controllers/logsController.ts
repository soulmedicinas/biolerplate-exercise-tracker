import { Request, Response } from 'express';
import { getDB } from '../src/initDb';
import { CustomError } from '../types';

const db = getDB();

export const getLogs = async (req: Request, res: Response) => {
  const userId = req.params._id;

  try {
    const user = await db.get('SELECT * FROM Users WHERE id = ?', userId);

    if (!user) {
      return res.status(400).json({
        message: `User with ${userId} does not exist!`,
      });
    }

    const userExerciseLogs = await db.all(
      `
      SELECT 
      Exercises.id,
      Exercises.description,
      Exercises.duration,
      Exercises.date
      FROM Exercises JOIN Users 
      ON (Users.id = Exercises.userId) 
      WHERE Users.id = ?
    `,
      userId
    );

    return res.status(201).json({
      message: "User's exercises fetched successfully",
      logs: userExerciseLogs,
      count: userExerciseLogs.length,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Something went wrong. Please try again later',
    });
  }
};
