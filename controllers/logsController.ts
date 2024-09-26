import { Request, Response } from 'express';
import { getDB } from '../src/initDb';
import { Exercise, User } from '../models/models';

const db = getDB();

// todo: Add params validity: for example checking if limit is a number etc.
export const getLogs = async (req: Request, res: Response) => {
  const userId = req.params._id;

  try {
    const user: User = await db.get('SELECT * FROM Users WHERE id = ?', userId);

    if (!user) {
      return res.status(400).json({
        message: `User with id = ${userId} does not exist!`,
      });
    }

    let userExerciseLogs: Exercise[] = await db.all(
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

    const { from, to, limit } = req.query;

    if (limit) {
      userExerciseLogs = userExerciseLogs.slice(0, +limit);
    }

    if (from) {
      userExerciseLogs = userExerciseLogs.filter((exercise) => new Date(exercise.date) >= new Date(from as string));
    }

    if (to) {
      userExerciseLogs = userExerciseLogs.filter((exercise) => new Date(exercise.date) <= new Date(to as string));
    }

    return res.status(201).json({
      message: "User's exercises fetched successfully",
      username: user.username,
      logs: userExerciseLogs,
      count: userExerciseLogs.length,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Something went wrong. Please try again later',
    });
  }
};
