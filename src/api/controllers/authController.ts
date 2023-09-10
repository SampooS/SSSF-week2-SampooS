import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import passport from '../../passport';
import CustomError from '../../classes/CustomError';
import {User, UserOutput} from '../../interfaces/User';
import { validationResult } from 'express-validator';
import userModel from '../models/userModel';
import bcrypt from 'bcryptjs';
import LoginMessageResponse from '../../interfaces/LoginMessageResponse';

const login = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      next(new CustomError(messages, 400));
      return;
    }

    const {user_name, password} = req.body;

    const user = await userModel.findOne({email: user_name});

    if (!user) {
      next(new CustomError('Incorrect username/password', 200));
      return;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      next(new CustomError('Incorrect username/password', 200));
      return;
    }

    const token = jwt.sign(
      {id: user._id, role: user.role},
      process.env.JWT_SECRET as string
    );

    const message: LoginMessageResponse = {
      message: 'Login successful',
      user: {
        user_name: user.user_name,
        email: user.email,
        _id: user._id,
      },
      token: token,
    };

    res.json(message);
  } catch (error) {
    next(new CustomError('Login failed', 500));
  }
};
export {login};
