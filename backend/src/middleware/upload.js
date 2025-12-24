import multer from "multer";
import { Upload } from "@aws-sdk/lib-storage";
import s3Client from "../config/awsConfig.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Define allowed file types
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "video/mp4",
    "video/quicktime",
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
  ];

  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, MP4, MP3, and WAV files are allowed."
      ),
      false
    );
  }
};

// Custom S3 storage for multer with AWS SDK v3
class S3Storage {
  constructor(options) {
    this.s3Client = options.s3Client;
    this.bucket = options.bucket;
  }

  _handleFile(req, file, cb) {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${req.user.id}/${Date.now()}-${uuidv4()}${fileExtension}`;

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucket,
        Key: fileName,
        Body: file.stream,
        ContentType: file.mimetype,
      },
    });

    upload
      .done()
      .then((data) => {
        cb(null, {
          filename: fileName,
          size: file.size,
          location: data.Location,
        });
      })
      .catch((err) => {
        cb(err);
      });
  }

  _removeFile(req, file, cb) {
    // Optional: implement file deletion if needed
    cb(null);
  }
}

// Configure multer for S3 uploads
const upload = multer({
  fileFilter,
  storage: new S3Storage({
    s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
});

export default upload;
