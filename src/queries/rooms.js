import generate from './crudGenerator.js';

export const fragments = {
    FIELDS:`
    id
    name
    desc
    `,
};

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("room", "rooms", fragments.FIELDS);

