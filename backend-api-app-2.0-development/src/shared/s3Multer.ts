import { Request as JWTRequest } from 'express-jwt';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client } from '../shared/s3Client';

const uploadToJobsS3 = () =>
  multer({
    storage: multerS3({
      s3: s3Client,
      bucket: process.env.AWS_BUCKET || 'scrap-it-development',
      metadata: function (_req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req: JWTRequest, file, cb) {
        let newFileName = Date.now().toString() + '-' + file.originalname;

        let fullPath = `jobs/${req.params.jobId}/` + newFileName;
        cb(null, fullPath);
      },
    }),
    limits: {
      fileSize: 1024 * 1024 * 20, // 20MB
    },
    fileFilter: (_req, file, cb) => {
      if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
        cb(null, true);
      } else {
        return cb(new Error('Invalid mimetype'));
      }
    },
  });

export const uploadToBookingS3 = () =>
  multer({
    storage: multerS3({
      s3: s3Client,
      bucket: process.env.AWS_BUCKET || 'scrap-it-development',
      metadata: function (_req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req: JWTRequest, file, cb) {
        let newFileName = Date.now().toString() + '-' + file.originalname;

        let fullPath = `booking/` + newFileName;
        cb(null, fullPath);
      },
    }),
    limits: {
      fileSize: 1024 * 1024 * 20, // 20MB
    },
    fileFilter: (_req, file, cb) => {
      if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
        cb(null, true);
      } else {
        return cb(new Error('Invalid mimetype'));
      }
    },
  });

export const fileUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET || 'scrap-it-development',
    metadata: function (_req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req: JWTRequest, file, cb) {
      let newFileName = Date.now().toString() + '-' + file.originalname;
      let fullPath = `files/${req.params.id}/` + newFileName;
      cb(null, fullPath);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 20, // 20MB
  },
});

export const companyLogoUpload = () =>
  multer({
    storage: multerS3({
      s3: s3Client,
      bucket: process.env.AWS_BUCKET || 'scrap-it-development',
      metadata: function (_req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req: JWTRequest, file, cb) {
        let newFileName = Date.now().toString() + '-' + file.originalname;
        let fullPath = `companyLogo/${newFileName}`;
        cb(null, fullPath);
      },
    }),
    limits: {
      fileSize: 1024 * 1024 * 20, // 20MB
    },
    fileFilter: (_req, file, cb) => {
      if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
        cb(null, true);
      } else {
        return cb(new Error('Invalid mimetype'));
      }
    },
  });

export default uploadToJobsS3;
