import {Point} from 'geojson';
import {Document, Date, Types} from 'mongoose';

// TODO: cat interface
interface Cat extends Document {
    cat_name: string;
    weight: number;
    filename: string;
    birthdate: Date;
    location: Point;
    owner: Types.ObjectId;
}

export {Cat};
