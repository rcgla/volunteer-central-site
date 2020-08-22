import generate from './crudGenerator.js';
import * as Roles from './roles.js';

export const fragments = {
    FIELDS: 
    `
    id
    name
    rolesInRoleGroupsByRoleGroupId {
        nodes {
            role {
                ${Roles.fragments.FIELDS}
            }
        }
    }
    `
};

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("roleGroup", "roleGroups", fragments.FIELDS);


