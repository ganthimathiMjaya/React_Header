import { S3 } from '@aws-sdk/client-s3';
import { env } from 'process';

const REGION = env.AWS_REGION;

const s3Client = new S3({ region: REGION });

export { s3Client };
