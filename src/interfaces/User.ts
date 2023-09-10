// TODO: user interface
import {Document} from 'mongoose';
interface User extends Document {
    _id: any;
    user_name: string;
    email: string;
    role: 'user' | 'admin';
    password: string;
}

interface LoginUser extends Document {
    user_name: string;
    password: string;
}

interface UserOutput {
    _id: any;
    user_name: string;
    email: string;
}

interface PostUser {
    user_name: string;
    email: string;
    password: string;
}

interface TokenUser {
    id: any;
    role: 'user' | 'admin';
}

interface UserTest {
    user_name: string;
    email: string;
    password: string;
}

export {User, LoginUser, UserOutput, TokenUser, PostUser, UserTest};
