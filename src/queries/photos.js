import generate from './crudGenerator.js';
import * as users from './users.js';
import * as events from './events.js';

const BASIC_FIELDS = () => `
id
url
alt
`;

const FIELDS = () => `
${BASIC_FIELDS()}
event {
    ${events.BASIC_FIELDS()}
}
user {
    ${users.FIELDS()}
}
`;

export { BASIC_FIELDS, FIELDS };
export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("photo", "photos", FIELDS);
