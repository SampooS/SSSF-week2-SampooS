import jwt from 'jsonwebtoken';
// TODO: create following functions:
// - catGetByUser - get all cats by current user id
// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
// - catPutAdmin - only admin can change cat owner
// - catDeleteAdmin - only admin can delete cat
// - catDelete - only owner can delete cat
// - catPut - only owner can update cat
// - catGet - get cat by id
// - catListGet - get all cats
// - catPost - create new cat

import {NextFunction, Response, Request} from 'express';
import catModel from '../models/catModel';
import CustomError from '../../classes/CustomError';
import {Cat, CatOutput} from '../../interfaces/Cat';
import {validationResult} from 'express-validator';
import DBMessageResponse from '../../interfaces/DBMessageResponse';
import PostMessageResponse from '../../interfaces/PostMessageResponse';
import {TokenUser, UserOutput} from '../../interfaces/User';
import userModel from '../models/userModel';
import { CastError } from 'mongoose';

const catListGet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cats = await catModel.find().populate('owner', '-role -password -__v');

        if (!cats || cats.length === 0) {
            throw new CustomError('No cats found', 404);
            return;
        }

        res.json(cats).status(200);

    } catch (error) {
        next(error);
    }
};

const catGet = async (
    req: Request<{id: String}, {}, {}>,
    res: Response,
    next: NextFunction
) => {
    try {
        const cat = await catModel.findById(req.params.id).populate('owner', '-role -password -__v') as CatOutput;

        if (!cat) {
            throw new CustomError('Cat not found', 404);
            return;
        };

        if (!cat) {
            throw new CustomError('Cat not found', 404);
        }

        res.json(cat).status(200);

    } catch (error) {
        next(error);
    }
};

const catPost = async (req: Request, res: Response, next: NextFunction) => {
    try {        
        const userFromToken = jwt.verify(
            req.headers.authorization?.split(" ")[1] as string,
            process.env.JWT_SECRET as string
        ) as TokenUser;
        
        if (!userFromToken) {
            next(new CustomError('User not found', 404));
            return;
        }

        const errors = validationResult(req);

        if (!errors.isEmpty) {
            const messages = errors
                .array()
                .map((error) => `${error.msg}: ${error.param}`)
                .join(', ');
            next(new CustomError(messages, 400));
            return;
        }

        const reqcat = req.body;
        reqcat.owner = userFromToken.id;

        const newcat: Cat = await catModel.create(reqcat);

        const resp: PostMessageResponse = {
            message: 'Cat posted',
            data: newcat,
        };
        res.json(resp).status(200);
    } catch (error) {
        res.json('Cat post failed').status(400);
        next(error);
    }
};

const catPut = async (req: Request<{id: String}, {}, {}>, res: Response, next: NextFunction) => {
    try {

        const userFromToken = jwt.verify(
            req.headers.authorization?.split(" ")[1] as string,
            process.env.JWT_SECRET as string
        ) as TokenUser;

        if (!userFromToken) {
            next(new CustomError('User not found', 404));
            return;
        }
        const editThisCat = await catModel.findById(req.params.id);

        if (userFromToken.id != editThisCat?.owner) {
            next(new CustomError('This cat belongs to another user', 401));
            return;
        }

        const newcat = await catModel.findByIdAndUpdate(req.params.id, req.body);

        const editedCat = await catModel.findById(req.params.id);

        res.json({
            message: 'Cat updated',
            data: editedCat
        }).status(200);
    } catch (error) {
        next(error);
    }
};

const catGetByUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userFromToken = jwt.verify(
            req.headers.authorization?.split(" ")[1] as string,
            process.env.JWT_SECRET as string
        ) as TokenUser;
    
        const cats = await catModel.find({owner: userFromToken.id});

        if (!cats || cats.length === 0) {
            throw new CustomError('No cats found', 404);
            return;
        }

        res.json(cats).status(200);
    } catch (error) {}
};

const catGetByBoundingBox = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const resp = {
        message: 'not done yet',
    };
    res.json(resp).status(200);
};

const catPutAdmin = async (req: Request, res: Response, next: NextFunction) => {
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

        if (userFromToken.role != 'admin') {
            next(new CustomError('This endpoint is for admin use only', 401));
            return;
        }

        const reqcat: Cat = req.body;

        const newcat = await catModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        if (!newcat) {
            next(new CustomError('Cat not found', 404));
            return;
        }

        const resp: DBMessageResponse = {
            message: 'Cat updated',
            data: newcat,
        };
        res.json(resp).status(200);
    } catch (error) {
        next(error);
        res.json('Server error').status(500);
    }
};

const catDeleteAdmin = async (req: Request<{id: String}, {}, {}>, res: Response, next: NextFunction) => {
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

        if (userFromToken.role != 'admin') {
            next(new CustomError('This endpoint is for admin use only', 401));
            return;
        }

        const deleted = await catModel.findByIdAndDelete(req.params.id);

        if (!deleted) {
            next(new CustomError('Cat not found', 404));
            return;
        }

        res.json({
            message: "Cat deleted",
            data: deleted
        }).status(200);

    } catch (error) {
        next(error);
        res.json('Server error').status(500);
    }
};

const catDelete = async (
    req: Request<{id: String}, {}, {}>,
    res: Response,
    next: NextFunction
) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty) {
            const messages = errors
                .array()
                .map((error) => `${error.msg}: ${error.param}`)
                .join(', ');
            next(new CustomError(messages, 400));
            return;
        }

        const cat = await catModel.findByIdAndDelete(req.params.id);
        if (!cat) {
            next(new CustomError('Cat not found', 404));
            return;
        }

        const resp: DBMessageResponse = {
            message: 'Cat deleted',
            data: cat,
        };
        res.json(resp);
    } catch (error) {
        next(new CustomError('Server error', 500));
    }
};

export {
    catListGet,
    catGet,
    catPost,
    catPut,
    catDelete,
    catPutAdmin,
    catGetByBoundingBox,
    catGetByUser,
    catDeleteAdmin,
};
