import generate from './crudGenerator.js';
import * as roles from './roles.js';
import * as users from './users.js';
import * as events from './events.js';

const BASIC_FIELDS = () => `
id
confirmed
dropped
`;

const FIELDS_WITHOUT_USER = () => `
${ BASIC_FIELDS() }
event {
    ${events.BASIC_FIELDS()}
}
role {
    ${roles.FIELDS()}
}
`;

const FIELDS = () => `
${ FIELDS_WITHOUT_USER() }
user {
    ${users.BASIC_FIELDS()}
}
`;


export { BASIC_FIELDS, FIELDS, FIELDS_WITHOUT_USER };

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("placement", "placements", FIELDS);
