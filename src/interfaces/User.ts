// TODO: user interface
import {Document} from 'mongoose';
interface User extends Document {
    user_name: string;
    email: string;
    role: 'user' | 'admin';
    password: string;
}


interface LoginUser extends Document {
    user_name: string,
    email: string,
    password: string,
}

interface UserOutput {
    _id: any,
    user_name: string,
    email: string
}
export {User, LoginUser, UserOutput};
