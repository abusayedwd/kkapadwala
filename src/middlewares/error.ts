import mongoose from 'mongoose';
import httpStatus from 'http-status';
import config from '../config/config';
import logger from '../config/logger';
import ApiError from '../utils/ApiError';
import { Request, Response, NextFunction } from 'express';

const errorConverter = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  let error = err as ApiError;
  if (!(error instanceof ApiError)) {
    const raw = err as { statusCode?: number; message?: string; stack?: string };
    const statusCode =
      raw.statusCode || err instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = raw.message || httpStatus[statusCode as keyof typeof httpStatus];
    error = new ApiError(statusCode, String(message), false, raw.stack);
  }
  next(error);
};

const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  let { statusCode, message } = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR] as string;
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};

export { errorConverter, errorHandler };
