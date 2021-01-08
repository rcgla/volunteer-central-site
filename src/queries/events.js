import generate from './crudGenerator.js';
import * as eventTypes from './eventTypes.js';
import * as tracks from './tracks.js';
import * as activities from './activities.js';
import * as locations from './locations.js';
import * as placements from './placements.js';

const BASIC_FIELDS = () => `
id
name
description
start
end
visibility
`;

const FIELDS = () => `
${BASIC_FIELDS()}
eventType {
    ${eventTypes.FIELDS()}
}
tracks {
    ${tracks.FIELDS()}
}
activities {
    ${activities.FIELDS()}
}
locations {
    ${locations.FIELDS()}
}
placements {
    ${placements.FIELDS()}
}
`;

export { BASIC_FIELDS, FIELDS };



export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("event", "events", FIELDS);