import generate from './crudGenerator.js';

const FIELDS = () => 
`
id
activityId
roomId
`;

export { FIELDS };
export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("activitiesRoom", "activitiesRooms", FIELDS);