import { Response } from 'express';

export const successResponse = <T>(res: Response, body: T, statusCode: StatusCodes = StatusCodes.OK) => res.status(statusCode).json(body);
export const errorResponse = (res: Response, message: string, statusCode: StatusCodes = StatusCodes.InternalServerError) =>
    res.status(statusCode).json({ message });

export enum StatusCodes {
    OK = 200,
    Created = 201,
    BadRequest = 400,
    NotFound = 404,
    InternalServerError = 500,
}
