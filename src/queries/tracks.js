import generate from './crudGenerator.js';
import * as trackTypes from './trackTypes.js';
import * as events from './events.js';

const BASIC_FIELDS = () => `
id
name
description
start
end
`;

const FIELDS = () => `
${BASIC_FIELDS()}
trackType {
    ${trackTypes.FIELDS()}
}
event {
    ${events.BASIC_FIELDS()}
}
`;
export { BASIC_FIELDS, FIELDS };

export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("track", "tracks", FIELDS);

