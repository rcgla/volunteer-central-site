import generate from './crudGenerator.js';

const FIELDS = () => `
id
name
phone
relation
`;

export { FIELDS };

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("emergencyContact", "emergencyContacts", FIELDS);

