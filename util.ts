import { Response } from 'express';

export const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export const getResponseWhenServerFailed = (res: Response) => {
  return res.status(500).json({
    message: 'Something went wrong. Please try again later',
  });
};
