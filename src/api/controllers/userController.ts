// TODO: create the following functions:
// - userGet - get user by id
// - userListGet - get all users
// - userPost - create new user. Remember to hash password
// - userPutCurrent - update current user
// - userDeleteCurrent - delete current user
// - checkToken - check if current user token is valid: return data from req.user. No need for database query

import { NextFunction, Request, Response } from "express";
import userModel from "../models/userModel";
import CustomError from "../../classes/CustomError";
import DBMessageResponse from "../../interfaces/DBMessageResponse";

const userListGet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userModel.find().select("-password");

        if (!users || users.length === 0) {
            next(new CustomError("couldn't find users", 404))
            return;
        }
        res.json(users);

    } catch (error) {
        next(new CustomError("Server error", 500));
    }
};

const userGet = async (req: Request<{id: String}, {}, {}>, res: Response, next: NextFunction) => {
    try {
        const user = await userModel.findById(req.params.id);

        if (!user) {
            next(new CustomError("couldn't find user", 404));
            return
        }
        res.json(user);

    } catch (error) {
        next(new CustomError("Server error", 500));
    }
};

const userPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newUser = await userModel.create(req.body);
        const resp: DBMessageResponse = {
            message: 'user posted',
            data: newUser
        };
        res.json(resp).status(200);
    } catch (error) {
        next(error);
    }
};

const userPutCurrent = async (req: Request, res: Response, next: NextFunction) => {
    const resp = {
        message: "not done yet"
    }
    res.json(resp)
}

const userDeleteCurrent = async (req: Request, res: Response, next: NextFunction) => {
    const resp = {
        message: "not done yet"
    }
    res.json(resp)
}

const checkToken = async (req: Request, res: Response, next: NextFunction) => {
    const resp = {
        message: "not done yet"
    }
    res.json(resp)
}

export {userGet, userListGet, userPost, userPutCurrent, userDeleteCurrent, checkToken};