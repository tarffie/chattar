import type { NextFunction, Response } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidatorError } from '../errors/AppError';

export default function errorHandler(
  err: Error,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  if (err instanceof ZodError) {
    res
      .status(400)
      .json({
        success: false,
        message: err.issues.map((key) => key.message),
        errors: err.issues,
      })
      .send();
  }

  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json({
        success: false,
        message: err.message,
      })
      .send();
  }

  if (err instanceof ValidatorError) {
    return res
      .status(err.statusCode)
      .json({
        success: false,
        message: err.message.toUpperCase(),
      })
      .send();
  }

  return res
    .status(500)
    .json({
      success: false,
      message: 'Internal Server Error',
    })
    .send();
}
