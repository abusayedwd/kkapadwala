import logger from '../config/logger';
import response from '../config/response';
import { Request, Response, NextFunction } from 'express';

const imageVerification = (req: Request, res: Response, next: NextFunction) => {
  const files = req.files || [];

  if (!Array.isArray(files) || files.length === 0) {
    logger.error('Images not found');
    return res.status(403).json(
      response({
        code: '403',
        message: 'Images not found',
      } as Record<string, unknown>)
    );
  }
  next();
};

export default imageVerification;
