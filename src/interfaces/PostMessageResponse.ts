import {Cat} from './Cat';
import {User, UserOutput} from './User';

export default interface DBMessageResponse {
    message: string;
    data: Cat | UserOutput;
}
