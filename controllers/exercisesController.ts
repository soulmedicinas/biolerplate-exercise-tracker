import { Request, Response } from 'express';
import { getDB } from '../src/initDb';
import { CreatedExerciseResponse } from '../models/models';
import { formatDate } from '../util';

const db = getDB();

// todo: Add body validity: for example date checking, checking if duration is a number etc.
export const createExercise = async (req: Request, res: Response) => {
  const userId = req.params._id;

  try {
    const user = await db.get('SELECT * FROM Users WHERE id = ?', userId);

    if (!user) {
      return res.status(400).json({
        message: `User with ${userId} does not exist!`,
      });
    }

    const { description, duration, date } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        message: 'No description provided!',
      });
    }

    if (!duration) {
      return res.status(400).json({
        message: 'No duration provided!',
      });
    }

    let transformedDescription = description.trim();
    let transformedDate = date || formatDate(new Date());

    const result = await db.run(
      'INSERT INTO Exercises (description, duration, date, userId) VALUES (?, ?, ?, ?)',
      transformedDescription,
      duration,
      transformedDate,
      userId
    );

    return res.status(201).json({
      message: 'Exercise created',
      exercise: {
        userId: +userId,
        exerciseId: result.lastID,
        duration: duration,
        description: transformedDescription,
        date: transformedDate,
      } as CreatedExerciseResponse,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Something went wrong. Please try again later',
    });
  }
};
