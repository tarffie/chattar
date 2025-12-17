import type { Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";

export const errorHandler = (
  err: Error,
  res: Response,
) => {
  console.log("Got and Error for you!");
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues,
    }).send();
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    }).send();
  }

  console.error('Unexpected error:', { error: err });
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  }).send();
};
