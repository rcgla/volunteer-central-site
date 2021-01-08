import * as events from './events.js';
import * as tracks from './tracks.js';
import * as userGroupTypes from './userGroupTypes.js';
import * as users from './users.js';
import generate from './crudGenerator.js';

const FIELDS = () => `
id
name
event {
    ${events.FIELDS()}
}
track {
    ${tracks.FIELDS()}
}
userGroupType {
    ${userGroupTypes.FIELDS()}
}
`;

const FIELDS_WITH_USERS = () => `
    ${FIELDS()}
    users {
        ${users.FIELDS()}
    }
`;

export { FIELDS, FIELDS_WITH_USERS };

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("userGroup", "userGroups", FIELDS);

export const {GET: GET_WITH_USERS, GET_ALL: GET_ALL_WITH_USERS}
    = generate("userGroup", "userGroups", FIELDS_WITH_USERS);
