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
import {Cat} from '../../interfaces/Cat';
import {validationResult} from 'express-validator';
import DBMessageResponse from '../../interfaces/DBMessageResponse';

const catListGet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cats = await catModel.find();
        res.json();
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
        const cat = catModel.find(req.params.id);

        if (!cat) {
            throw new CustomError('Cat not found', 404);
        }
        res.json();
    } catch (error) {
        next(error);
    }
};

const catPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newcat = await catModel.create(req.body);
        const resp: DBMessageResponse = {
            message: 'cat posted',
            data: newcat
        };
        res.json(resp).status(200);
    } catch (error) {
        next(error);
    }
};

const catPut = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reqcat: Cat = req.body;
        const newcat = await catModel.findByIdAndUpdate(reqcat.id, req.body, {
            new: true,
        });
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
        const cat = await catModel.find;
    } catch (error) {}
};

const catGetByBoundingBox = async (req: Request, res: Response, next: NextFunction) => {
    const resp = {
        message: "not done yet"
    }
    res.json(resp)
}

const catPutAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const resp = {
        message: "not done yet"
    }
    res.json(resp)
}

const catDeleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const resp = {
        message: "not done yet"
    }
    res.json(resp)
}

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

export {catListGet, catGet, catPost, catPut, catDelete, catPutAdmin, catGetByBoundingBox, catGetByUser, catDeleteAdmin};
