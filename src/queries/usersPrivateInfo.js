import generate from './crudGenerator.js';

const FIELDS = () => `
id
phone
address
bio
email
`;

export { FIELDS };

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("usersPrivateInfo", "usersPrivateInfos", FIELDS);
