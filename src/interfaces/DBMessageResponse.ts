import {Cat} from './Cat';
import {User} from './User';

export default interface DBMessageResponse {
    message: string;
    data: Cat | Cat[] | User | User[];
}
