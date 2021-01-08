import * as userGroups from './userGroups.js';
import * as users from './users.js';

import generate from './crudGenerator.js';

const FIELDS = () => `
id
user {
    ${users.FIELDS()}
}
userGroup {
    ${userGroups.FIELDS()}
}
`;

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("usersUserGroup", "usersUserGroups", FIELDS);

