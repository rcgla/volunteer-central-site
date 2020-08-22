import * as Users from "./users.js";
import generate from './crudGenerator.js';

export const fragments = {
    FIELDS:`
    id
    user {
        ${Users.fragments.FIELDS}
    }
    dateInvited
    `,
};

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("invitation", "invitations", fragments.FIELDS);


