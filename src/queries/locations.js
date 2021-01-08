import generate from './crudGenerator.js';
import * as rooms from './rooms.js';

const BASIC_FIELDS = () => `
id
name
description
address
notes
`;

const FIELDS = () => `
${BASIC_FIELDS()}
rooms {
    ${rooms.BASIC_FIELDS()}
}
`;

export { BASIC_FIELDS, FIELDS };

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("location", "locations", FIELDS);
