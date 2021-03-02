import generate from './crudGenerator.js';
import * as placements from './placements.js';
import * as logins from './logins.js';
import * as usersPrivateInfo from './usersPrivateInfo.js';
import * as usersProtectedInfo from './usersProtectedInfo.js';
import * as emergencyContacts from './emergencyContacts.js';
import * as userGroups from './userGroups.js';
import * as photos from './photos.js';
import * as events from './events.js';

const BASIC_FIELDS = () => `
id
name
userType
`;

const FIELDS = () => `
${BASIC_FIELDS()}
login {
    ${logins.FIELDS()}
}
usersPrivateInfo {
    ${usersPrivateInfo.FIELDS()}
}
usersProtectedInfo {
    ${usersProtectedInfo.FIELDS()}
}
emergencyContacts {
    ${emergencyContacts.FIELDS()}
}
placements {
    ${placements.FIELDS_WITHOUT_USER()}
}
userGroups {
    ${userGroups.FIELDS()}
}
photos {
    ${photos.BASIC_FIELDS()}
    event {
        ${events.BASIC_FIELDS()}
    }
}
`;

export { BASIC_FIELDS, FIELDS };
    
export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("user", "users", FIELDS);

export const GET_ALL_SORTED = () => `
query {
    users(orderBy: NAME_ASC) {
        ${FIELDS()}
    }
}
`;