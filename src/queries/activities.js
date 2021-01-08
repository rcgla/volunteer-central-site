import generate from './crudGenerator.js';
import * as activityTypes from './activityTypes.js';
import * as locations from './locations.js';
import * as tracks from './tracks.js';
import * as rooms from './rooms.js';
import * as events from './events.js';

const FIELDS = () => `
id
name
description
notes
start
end
repeat
visibility
restrictVisibility
event {
    ${events.BASIC_FIELDS()}
}
activityType {
    ${activityTypes.FIELDS()}
}
location {
    ${locations.FIELDS()}
}
track {
    ${tracks.FIELDS()}
}
rooms {
    ${rooms.FIELDS()}
}
`;

export { FIELDS };
export const {CREATE, DELETE, UPDATE, GET, GET_ALL} 
    = generate("activity", "activities", FIELDS);