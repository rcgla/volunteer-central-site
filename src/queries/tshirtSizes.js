import generate from './crudGenerator.js';

export const fragments = {
    FIELDS:`
    id
    name
    order
    `,
};

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("tShirtSize", "tShirtSizes", fragments.FIELDS);

