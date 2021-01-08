import generate from './crudGenerator.js';
import * as locations from './locations.js';

const BASIC_FIELDS = () => `
id
name
description
notes
`;

const FIELDS = () => `
${BASIC_FIELDS()}
location {
    ${locations.BASIC_FIELDS()}
}
`;

export { BASIC_FIELDS, FIELDS };

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("room", "rooms", FIELDS);

