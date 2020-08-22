import * as sessionTypes from './sessionTypes.js';
import generate from './crudGenerator.js';

export const fragments = {
    FIELDS: 
    `
    id
    sessionType {
        ${sessionTypes.fragments.FIELDS}
    }
    name
    start
    end
    `
};

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("session", "sessions", fragments.FIELDS);