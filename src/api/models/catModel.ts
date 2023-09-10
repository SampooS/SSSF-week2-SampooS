import mongoose, {Schema, model} from 'mongoose';
import {Cat} from '../../interfaces/Cat';

// TODO: mongoose schema for cat
const catSchema = new Schema<Cat>({
    cat_name: {
        type: String,
        required: true,
        minlength: 2,
    },
    weight: {
        type: Number,
        required: true,
        min: 0,
    },
    filename: {
        type: String,
        required: false,
    },
    birthdate: {
        type: Date,
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true,
        },
        coordinates: {
            type: [Number],
        },
    },
    owner: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

export default model<Cat>('Cat', catSchema);
