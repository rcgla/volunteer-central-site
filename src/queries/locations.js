import generate from './crudGenerator.js';
import * as Rooms from './rooms.js';

export const fragments = {
    FIELDS:`
    id
    name
    desc
    roomsByLocationId {
        ${Rooms.fragments.FIELDS}
    }
    `,
};

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("location", "locations", fragments.FIELDS);

