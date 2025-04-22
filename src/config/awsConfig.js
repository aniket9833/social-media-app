import { S3Client } from '@aws-sdk/client-s3';
import serverConfig from './serverConfig.js';

const s3Config = {
  region: serverConfig.AWS_REGION,
  credentials: {
    accessKeyId: serverConfig.AWS_ACCESS_KEY_ID,
    secretAccessKey: serverConfig.AWS_SECRET_ACCESS_KEY,
  },
};

const s3Client = new S3Client(s3Config);

export default s3Client;
