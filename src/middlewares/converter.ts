import fs from 'fs/promises';
import path from 'path';
import convert from 'heic-convert';
import { Request, Response, NextFunction } from 'express';

const convertHeicToPngMiddleware = (UPLOADS_FOLDER: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.file && (req.file.mimetype === 'image/heic' || req.file.mimetype === 'image/heif')) {
      const heicBuffer = await fs.readFile(req.file.path);
      const pngBuffer = await convert({
        buffer: heicBuffer,
        format: 'PNG',
      });

      const originalFileName = path.basename(req.file.originalname, path.extname(req.file.originalname));
      const currentDateTime = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const pngFileName = `${originalFileName}_${currentDateTime}.png`;
      const pngFilePath = path.join(UPLOADS_FOLDER, pngFileName);

      await fs.writeFile(pngFilePath, pngBuffer);

      await fs.unlink(req.file.path);

      req.file.path = pngFilePath;
      req.file.filename = pngFileName;
      req.file.mimetype = 'image/png';
    }

    next();
  };
};

export default convertHeicToPngMiddleware;
