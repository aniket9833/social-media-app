import multer from 'multer';
import multerS3 from 'multer-s3';
import s3Client from '../config/awsConfig.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define allowed file types
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
  ];

  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPEG, PNG, MP4, MP3, and WAV files are allowed.'
      ),
      false
    );
  }
};

// Configure multer for S3 uploads
const upload = multer({
  fileFilter,
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${
        req.user.id
      }/${Date.now()}-${uuidv4()}${fileExtension}`;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
});

export default upload;
