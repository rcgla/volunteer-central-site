import generate from './crudGenerator.js';

const FIELDS = () => 
`
id
activityId
roleId
`;

export { FIELDS };
export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("activitiesRole", "activitiesRoles", FIELDS);