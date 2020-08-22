import generate from './crudGenerator.js';

export const fragments = {
    FIELDS:`
    id
    name
    address
    phone
    `,
};

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("emergencyContact", "emergencyContacts", fragments.FIELDS);

