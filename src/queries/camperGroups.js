import * as Sessions from './sessions.js';
import generate from './crudGenerator.js';

export const fragments = {
    FIELDS:`
    id
    name
    session {
        ${Sessions.fragments.FIELDS}
    }
    track
    `,
};

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("camperGroup", "camperGroups", fragments.FIELDS);

