import multer from 'multer';
import path from 'path';

export default function (UPLOADS_FOLDER: string) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const filename =
        file.originalname.replace(fileExt, '').toLowerCase().split(' ').join('-') + '-' + Date.now();

      cb(null, filename + fileExt);
    },
  });

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image',
    'audio',
    'video',
  ];

  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      const fileType = file.mimetype.split('/')[0];

      if (allowedTypes.includes(file.mimetype) || allowedTypes.includes(fileType)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'));
      }
    },
  });
  return upload;
}
