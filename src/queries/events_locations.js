import generate from './crudGenerator.js';

const FIELDS = () => `
id
eventId
locationId
`;

export { FIELDS };

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("eventsLocation", "eventsLocations", FIELDS);