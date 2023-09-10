import {Point} from 'geojson';
import {Document, Date, Types} from 'mongoose';

// TODO: cat interface
interface Cat extends Document {
    _id: any;
    cat_name: String;
    weight: number;
    filename: String;
    birthdate: Date;
    location: Point;
    owner: Types.ObjectId;
}

interface PostCat {
    cat_name: String;
    weight: number;
    birthdate: Date;
    location: Point;
    owner: Types.ObjectId;
};

interface CatOutput {
    location: Point;
    _id: any;
    cat_name: String;
    weight: any;
    birthdate: Date;
    owner: {
        _id: any;
        user_name: String;
        email: String;
    }
}

export {Cat, PostCat, CatOutput};
