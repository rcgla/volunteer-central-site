import generate from './crudGenerator.js';

const FIELDS = () => 
`
id
activityId
roleIds
`;

export { FIELDS };
export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("activitiesRole", "activitiesRoles", FIELDS);