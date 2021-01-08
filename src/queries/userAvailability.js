import generate from './crudGenerator.js';
import * as users from './users.js';
import * as events from './events.js';

const BASIC_FIELDS = () => `
id
start
end
`;

const FIELDS = () => `
${BASIC_FIELDS()}
user {
    ${users.FIELDS()}
}
event {
    ${events.FIELDS()}
}
`;
export { BASIC_FIELDS, FIELDS };

const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("userAvailability", "userAvailabilities", FIELDS);

export {
    CREATE, DELETE, UPDATE, GET, GET_ALL
};