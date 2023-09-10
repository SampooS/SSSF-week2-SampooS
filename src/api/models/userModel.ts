import {Schema, model} from 'mongoose';
import {User} from '../../interfaces/User';

// TODO: mongoose schema for user
const userSchema = new Schema<User>({
    user_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        required: true,
    },
    password: {
        type: String,
        hide: true,
        required: true,
    },
});

export default model<User>('User', userSchema);
