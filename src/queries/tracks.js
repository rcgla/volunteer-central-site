import generate from './crudGenerator.js';

export const fragments = {
    FIELDS:`
    id
    name
    `,
};

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("track", "tracks", fragments.FIELDS);

