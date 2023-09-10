/* eslint-disable @typescript-eslint/no-unused-vars */
import jwt from 'jsonwebtoken';
import {NextFunction, Request, Response} from 'express';
import sharp from 'sharp';
import {ExifImage} from 'exif';
import ErrorResponse from './interfaces/ErrorResponse';
import CustomError from './classes/CustomError';
import { TokenUser, UserOutput } from './interfaces/User';
import userModel from './api/models/userModel';

// convert GPS coordinates to decimal format
// for longitude, send exifData.gps.GPSLongitude, exifData.gps.GPSLongitudeRef
// for latitude, send exifData.gps.GPSLatitude, exifData.gps.GPSLatitudeRef
const gpsToDecimal = (gpsData: number[], hem: string) => {
  let d = gpsData[0] + gpsData[1] / 60 + gpsData[2] / 3600;
  return hem === 'S' || hem === 'W' ? (d *= -1) : d;
};

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(`🔍 - Not Found - ${req.originalUrl}`, 404);
  next(error);
};

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  console.error('errorHandler', err.message);
  res.status(err.status || 500);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

const getCoordinates = (req: Request, res: Response, next: NextFunction) => {
  const defaultPoint = {
    type: 'Point',
    coordinates: [24, 61],
  };
  try {
    // coordinates below should be an array of GPS coordinates in decimal format: [longitude, latitude]
    new ExifImage({image: req.file?.path}, (error, exifData) => {
      if (error) {
        res.locals.coords = defaultPoint;
        next();
      } else {
        try {
          const lon = gpsToDecimal(
            exifData.gps.GPSLongitude || [0, 0, 0],
            exifData.gps.GPSLongitudeRef || 'N'
          );
          const lat = gpsToDecimal(
            exifData.gps.GPSLatitude || [0, 0, 0],
            exifData.gps.GPSLatitudeRef || 'E'
          );
          const coordinates = {
            type: 'Point',
            coordinates: [lon, lat],
          };
          res.locals.coords = coordinates;
          next();
        } catch (err) {
          res.locals.coords = defaultPoint;
          next();
        }
      }
    });
  } catch (error) {
    res.locals.coords = defaultPoint;
    next();
  }
};

const makeThumbnail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await sharp(req.file?.path)
      .resize(160, 160)
      .png()
      .toFile(req.file?.path + '_thumb');
    next();
  } catch (error) {
    next(new CustomError('Thumbnail not created', 500));
  }
};

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bearer = req.headers.authorization;

    if (!bearer) {
      next(new CustomError('No token', 401));
      return;
    }

    const token = bearer.split(' ')[1];

    if (!token) {
      next(new CustomError('No token', 401));
      return;
    }

    const userFromToken: TokenUser = jwt.verify(token, process.env.JWT_SECRET as string) as TokenUser;

    const user = await userModel.findById(userFromToken.id).select('-password').select("-role") as UserOutput;

  } catch (error) {
    next(new CustomError('Server error', 500));    
  }
}

export {notFound, errorHandler, getCoordinates, makeThumbnail, authenticate};
