import { Request, Response } from 'express';
import { getDB } from '../src/initDb';
import { CreatedExerciseResponse } from '../models/models';
import { formatDate, getResponseWhenServerFailed } from '../util';

const db = getDB();

// todo: Add body validity (with some kind of library):
// todo: check: date format and if duration is a number,
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

    const createdExercise: CreatedExerciseResponse = {
      userId: +userId,
      exerciseId: result.lastID,
      duration: duration,
      description: transformedDescription,
      date: transformedDate,
    };

    return res.status(201).json({
      message: 'Exercise created',
      exercise: createdExercise,
    });
  } catch (err) {
    return getResponseWhenServerFailed(res);
  }
};
