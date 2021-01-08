import generate from './crudGenerator.js';

const FIELDS = () => `
id
name
`;

export { FIELDS };

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("trackType", "trackTypes", FIELDS);