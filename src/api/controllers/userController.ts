import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
// TODO: create the following functions:
// - userGet - get user by id
// - userListGet - get all users
// - userPost - create new user. Remember to hash password
// - userPutCurrent - update current user
// - userDeleteCurrent - delete current user
// - checkToken - check if current user token is valid: return data from req.user. No need for database query

import {NextFunction, Request, Response} from 'express';
import userModel from '../models/userModel';
import CustomError from '../../classes/CustomError';
import DBMessageResponse from '../../interfaces/DBMessageResponse';
import LoginMessageResponse from '../../interfaces/LoginMessageResponse';
import {TokenUser, User, UserOutput} from '../../interfaces/User';

const userListGet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userModel
            .find()
            .select('-password')
            .select('-role');

        if (!users || users.length === 0) {
            next(new CustomError("couldn't find users", 404));
            return;
        }
        res.json(users);
    } catch (error) {
        next(new CustomError('Server error', 500));
    }
};

const userGet = async (
    req: Request<{_id: String}, {}, {}>,
    res: Response,
    next: NextFunction
) => {
    try {

        const user = await userModel
            .findById(req.params._id)
            .select('-password')
            .select('-role');

        if (!user) {
            next(new CustomError("couldn't find user", 404));
            return;
        }
        res.json(user).status(200);
    } catch (error) {
        next(new CustomError('Server error', 500));
    }
};

const userPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newUser = req.body;

        newUser.role = 'user';
        newUser.password = await bcrypt.hash(newUser.password, 15);

        const returnedUser = await userModel.create(req.body);

        const resp: DBMessageResponse = {
            message: 'user posted',
            data: {
                _id: returnedUser._id,
                user_name: returnedUser.user_name,
                email: returnedUser.email,
            },
        };
        res.json(resp).status(200);
    } catch (error) {
        next(error);
    }
};

const userPutCurrent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
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

        const userFromToken = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as TokenUser;

        const newUser = req.body;

        if (newUser.password != null) {
            newUser.password = await bcrypt.hash(newUser.password, 15);
        }

        const returnedUser = await userModel.findByIdAndUpdate(
            userFromToken.id,
            newUser,
            {new: true}
        );

        if (!returnedUser) {
            next(new CustomError("couldn't find user", 404));
            return;
        }

        const resp: DBMessageResponse = {
            message: 'user updated',
            data: {
                _id: returnedUser._id,
                user_name: returnedUser.user_name,
                email: returnedUser.email,
            },
        };
        res.json(resp).status(200);
    } catch (error) {
        res.status(500);
        next(error);
    }
};

const userDeleteCurrent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
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

        const userFromToken = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as TokenUser;

        const deletedUser = await userModel.findByIdAndDelete(userFromToken.id);

        if (!deletedUser) {
            next(new CustomError("couldn't find user", 404));
            return;
        }

        const resp: DBMessageResponse = {
            message: 'user deleted',
            data: {
                _id: deletedUser._id,
                user_name: deletedUser.user_name,
                email: deletedUser.email,
            },
        };
        res.json(resp).status(200);
    } catch (error) {
        res.status(500);
        next(error);
    }
};

const checkToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userFromToken = jwt.verify(
            req.headers.authorization?.split(' ')[1] as string,
            process.env.JWT_SECRET as string
        ) as TokenUser;

        const returnThisUser = await userModel.findById(userFromToken.id);

        if (!returnThisUser) {
            next(new CustomError("couldn't find user matching token", 404));
            return;
        }

        const resp = {
                _id: returnThisUser._id,
                user_name: returnThisUser.user_name,
                email: returnThisUser.email,
        };

        res.json(resp).status(200);
    } catch (error) {
        res.status(500);
        next(error);
    }
};

export {
    userGet,
    userListGet,
    userPost,
    userPutCurrent,
    userDeleteCurrent,
    checkToken,
};
