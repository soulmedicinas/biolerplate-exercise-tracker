import { ValidationChain, validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from '../utils/response';

export const validateRequest = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.all(validations.map((validation) => validation.run(req)));

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BadRequest).json({
                message: 'Validation error',
                errors: errors.array().map((err) => ({
                    message: err.msg,
                })),
            });
        }

        next();
    };
};
