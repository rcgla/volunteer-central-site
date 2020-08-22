import generate from './crudGenerator.js';

export const fragments = {
    FIELDS: 
    `
    id
    transportType
    start
    notes
    `
};

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("pickupAuthorization", "pickupAuthorizations", fragments.FIELDS);

